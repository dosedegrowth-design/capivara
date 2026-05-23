import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createAdminClient } from "@/lib/supabase/admin";
import { RelatorioPDF } from "@/lib/pdf/template";
import { logError } from "@/lib/log";
import type { ConsultaResult } from "@/lib/consultas/mock-data";
import { sendEmail } from "@/lib/email/client";
import { emailConsultaPronta } from "@/lib/email/templates";
import { findPlano } from "@/lib/consultas/planos";
import { dispatchEvent } from "@/lib/webhooks";

/**
 * POST /api/pdf/render
 *
 * Recebe `consultationId` e:
 *  1. Carrega a consulta com result_jsonb estruturado
 *  2. Renderiza PDF via react-pdf
 *  3. Faz upload pro Supabase Storage (bucket capivara-relatorios-pdf)
 *  4. Cria signed URL (7 dias)
 *  5. Atualiza consultations.pdf_url
 *
 * Disparado pela Edge Function process-consultation apos a consulta completar.
 * Tambem pode ser chamado manualmente pra regerar PDF.
 *
 * Auth: header `x-internal-key` deve ser igual a SUPABASE_SERVICE_ROLE_KEY.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface RenderRequest {
  consultationId: string;
}

const BUCKET = "capivara-relatorios-pdf";
const SIGNED_URL_DAYS = 7;

export async function POST(req: NextRequest) {
  // Validar chave interna
  const key = req.headers.get("x-internal-key");
  if (!key || key !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: RenderRequest;
  try {
    body = (await req.json()) as RenderRequest;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!body.consultationId) {
    return NextResponse.json({ error: "consultationId obrigatorio" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1. Carregar consulta
  const { data: consulta, error: loadErr } = await admin
    .from("consultations")
    .select("*")
    .eq("id", body.consultationId)
    .maybeSingle();

  if (loadErr || !consulta) {
    return NextResponse.json({ error: "consulta nao encontrada" }, { status: 404 });
  }

  if (!consulta.result_jsonb) {
    return NextResponse.json({ error: "consulta sem resultado" }, { status: 400 });
  }

  const result = consulta.result_jsonb as ConsultaResult;

  try {
    // 2. Renderizar PDF (Buffer)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";
    const verificationUrl = `${siteUrl}/verificar/${consulta.id}`;

    const buffer = await renderToBuffer(
      RelatorioPDF({
        consultationId: consulta.id,
        result,
        targetValue: consulta.target_value,
        generatedAt: consulta.completed_at ?? new Date().toISOString(),
        verificationUrl,
      })
    );

    // 3. Upload pro Storage
    const path = `${consulta.user_id}/${consulta.id}.pdf`;
    const { error: uploadErr } = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: "application/pdf",
        cacheControl: "31536000",
        upsert: true,
      });

    if (uploadErr) {
      await logError({
        context: "pdf_render",
        severity: "error",
        message: "Falha ao fazer upload do PDF",
        error: uploadErr,
        consultationId: consulta.id,
      });
      return NextResponse.json({ error: "upload failed" }, { status: 500 });
    }

    // 4. Signed URL
    const { data: signed, error: signErr } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_DAYS * 24 * 60 * 60);

    if (signErr || !signed) {
      await logError({
        context: "pdf_render",
        severity: "error",
        message: "Falha ao criar signed URL",
        error: signErr ?? undefined,
        consultationId: consulta.id,
      });
      return NextResponse.json({ error: "sign failed" }, { status: 500 });
    }

    // 5. Atualizar consulta
    await admin
      .from("consultations")
      .update({ pdf_url: signed.signedUrl })
      .eq("id", consulta.id);

    // 6. Email "consulta pronta" (fire-and-forget; idempotente via flag)
    try {
      if (!consulta.email_completion_sent_at) {
        // Carregar profile pra pegar nome + email
        const { data: profile } = await admin
          .from("profiles")
          .select("full_name, email")
          .eq("id", consulta.user_id)
          .maybeSingle();

        if (profile?.email) {
          const plano = findPlano(consulta.plan_tier);
          const categoriaLabel: "CPF" | "CNPJ" | "Veicular" =
            consulta.category === "cpf"
              ? "CPF"
              : consulta.category === "cnpj"
              ? "CNPJ"
              : "Veicular";

          const tpl = emailConsultaPronta({
            nome: profile.full_name ?? "voce",
            categoria: categoriaLabel,
            target: consulta.target_value,
            plano: plano?.nome ?? consulta.plan_tier,
            consultationId: consulta.id,
            pdfUrl: signed.signedUrl,
          });

          const r = await sendEmail({
            to: profile.email,
            subject: tpl.subject,
            html: tpl.html,
            tags: [
              { name: "type", value: "consultation_ready" },
              { name: "category", value: consulta.category },
            ],
          });

          if (r.ok) {
            await admin
              .from("consultations")
              .update({ email_completion_sent_at: new Date().toISOString() })
              .eq("id", consulta.id);
          }
        }
      }
    } catch (emailErr) {
      // Nao bloqueia o response: log e segue
      await logError({
        context: "pdf_render.email",
        severity: "warning",
        message: "Falha ao enviar email de consulta pronta",
        error: emailErr instanceof Error ? emailErr : new Error(String(emailErr)),
        consultationId: consulta.id,
      });
    }

    // 7. Dispatch webhook B2B consultation.completed (se company_id setado)
    if (consulta.company_id) {
      try {
        await dispatchEvent(consulta.company_id, "consultation.completed", {
          consultation_id: consulta.id,
          external_reference: consulta.external_reference ?? null,
          plan_id: consulta.plan_tier,
          category: consulta.category,
          target: consulta.target_value,
          status: "completed",
          pdf_url: signed.signedUrl,
          completed_at: consulta.completed_at ?? new Date().toISOString(),
        });
      } catch (whErr) {
        await logError({
          context: "pdf_render.webhook_dispatch",
          severity: "warning",
          message: "Falha ao despachar webhook consultation.completed",
          error: whErr instanceof Error ? whErr : new Error(String(whErr)),
          consultationId: consulta.id,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      url: signed.signedUrl,
      path,
    });
  } catch (err) {
    await logError({
      context: "pdf_render",
      severity: "critical",
      message: "Excecao ao gerar PDF",
      error: err instanceof Error ? err : new Error(String(err)),
      consultationId: consulta.id,
    });
    return NextResponse.json(
      { error: "render exception" },
      { status: 500 }
    );
  }
}
