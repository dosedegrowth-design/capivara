// =========================================================================
// Capivara · Edge Function process-consultation
//
// Disparada pelo webhook Asaas apos confirmacao de pagamento (PAYMENT_CONFIRMED).
//
// Fluxo:
//   1. Recebe { consultationId }
//   2. Carrega a consulta no Supabase
//   3. Marca status='processing'
//   4. Resolve PLAN_API_MAP[plan_tier] -> lista de APIs do API Full
//   5. Para cada API: verifica cache -> chama API Full -> salva no cache
//   6. Consolida resultado em result_jsonb
//   7. (futuro) Gera PDF via fetch em /api/pdf/render
//   8. UPDATE consultations(status='completed', result_jsonb, pdf_url)
//
// Por enquanto: mock — popula result_jsonb com um placeholder ate API Full
// estar contratada. Suficiente pra demonstrar o ciclo end-to-end.
// =========================================================================

// @ts-expect-error - deno runtime
import { createClient } from "jsr:@supabase/supabase-js@2";

type ProcessRequest = { consultationId: string };

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = (await req.json().catch(() => null)) as ProcessRequest | null;
  if (!body?.consultationId) {
    return new Response(JSON.stringify({ error: "consultationId obrigatorio" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, serviceKey, {
    db: { schema: "capivara" },
    auth: { persistSession: false },
  });

  // ---- 1. Carregar consulta ----
  const { data: consulta, error: loadErr } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", body.consultationId)
    .maybeSingle();

  if (loadErr || !consulta) {
    return resp(404, { error: "Consulta nao encontrada" });
  }

  if (consulta.status !== "paid") {
    return resp(200, { ok: true, message: "Consulta nao esta paga, ignorando." });
  }

  // ---- 2. Marca processing ----
  await supabase
    .from("consultations")
    .update({
      status: "processing",
      processing_started_at: new Date().toISOString(),
    })
    .eq("id", consulta.id);

  // ---- 3. Mock de processamento (substituir por chamadas API Full) ----
  // TODO Fase 7: integrar API Full real
  await new Promise((r) => setTimeout(r, 1500));

  const mockResult = {
    _mock: true,
    _generated_at: new Date().toISOString(),
    category: consulta.category,
    plan_tier: consulta.plan_tier,
    target: consulta.target_normalized,
    sections: {
      cadastrais: { status: "mock", message: "Aguardando integracao API Full" },
      financeiro: { status: "mock", message: "Aguardando integracao API Full" },
    },
  };

  // ---- 4. Finaliza ----
  const { error: updateErr } = await supabase
    .from("consultations")
    .update({
      status: "completed",
      result_jsonb: mockResult,
      completed_at: new Date().toISOString(),
      api_total_cost_cents: 0, // sem custo real ainda
    })
    .eq("id", consulta.id);

  if (updateErr) {
    return resp(500, { error: "Falha ao salvar resultado" });
  }

  return resp(200, { ok: true, consultationId: consulta.id });
});

function resp(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
