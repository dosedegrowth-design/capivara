import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { aceitarConviteAction } from "@/app/(empresa)/empresa/equipe/actions";

/**
 * Aceite de convite de equipe.
 *
 * Fluxo:
 *  1. Usuario recebe email com link /aceitar-convite/{token}
 *  2. Se nao logado: mostra CTA pra login/cadastro (preservando token)
 *  3. Se logado: valida token + email, mostra preview, botao "Aceitar"
 *  4. Ao aceitar: chama aceitarConviteAction que cria company_members
 */

export default async function AceitarConvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;
  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("company_invites")
    .select("id, company_id, email, role, expires_at, accepted_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return (
      <ShellMessage
        title="Convite não encontrado"
        message="O link do convite é inválido. Peça pra pessoa que te convidou reenviar o convite."
      />
    );
  }

  if (invite.accepted_at) {
    return (
      <ShellMessage
        title="Convite já aceito"
        message="Esse convite já foi aceito. Se foi você, entre no seu painel."
        ctaHref="/empresa"
        ctaLabel="Ir pro painel"
      />
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <ShellMessage
        title="Convite expirado"
        message="Esse convite passou da validade (7 dias). Peça pra pessoa que te convidou enviar de novo."
      />
    );
  }

  const { data: empresa } = await admin
    .from("companies")
    .select("name")
    .eq("id", invite.company_id)
    .maybeSingle();

  const user = await getCurrentUser();

  if (!user) {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "https";
    const host = h.get("host") ?? "suacapivara.com.br";
    const returnTo = encodeURIComponent(`${proto}://${host}/aceitar-convite/${token}`);
    return (
      <ShellMessage
        title={`${empresa?.name ?? "Uma empresa"} te convidou`}
        message={`Faça login com ${invite.email} pra aceitar. Se não tem conta, cadastre agora — você entra direto na empresa.`}
        ctaHref={`/login?email=${encodeURIComponent(invite.email)}&redirect=${returnTo}`}
        ctaLabel="Fazer login"
        secondaryHref={`/cadastro?email=${encodeURIComponent(invite.email)}&redirect=${returnTo}`}
        secondaryLabel="Criar conta"
      />
    );
  }

  const userEmail = (user.email ?? "").toLowerCase();
  const emailMatches = userEmail === invite.email.toLowerCase();

  if (!emailMatches) {
    return (
      <ShellMessage
        title="Email não bate"
        message={`Este convite é pra ${invite.email}, mas você está logado como ${userEmail}. Faça logout e entre com o email certo.`}
        ctaHref="/logout"
        ctaLabel="Sair"
      />
    );
  }

  if (sp.ok === "1") {
    return (
      <ShellMessage
        title="Convite aceito!"
        message={`Você agora faz parte de ${empresa?.name ?? "essa empresa"}. Bora começar?`}
        ctaHref="/empresa"
        ctaLabel="Ir pro painel"
      />
    );
  }

  async function accept() {
    "use server";
    const result = await aceitarConviteAction(token);
    if (!result.ok) {
      redirect(`/aceitar-convite/${token}?error=${encodeURIComponent(result.error)}`);
    }
    redirect(`/aceitar-convite/${token}?ok=1`);
  }

  const roleLabel =
    invite.role === "admin"
      ? "administrador (acesso total)"
      : invite.role === "operator"
      ? "operador (pode criar consultas)"
      : "visualizador (somente leitura)";

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-cocoa">
            Você foi convidado
          </h1>
          <p className="mt-2 text-tabaco">
            <strong>{empresa?.name ?? "Uma empresa"}</strong> quer te adicionar como <em>{roleLabel}</em>.
          </p>
        </div>

        {sp.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm p-3">
            {friendlyError(sp.error)}
          </div>
        ) : null}

        <form action={accept}>
          <button
            type="submit"
            className="w-full rounded-lg bg-saffron px-6 py-3 font-display font-semibold text-cocoa hover:brightness-95"
          >
            Aceitar convite
          </button>
        </form>

        <p className="text-xs text-tabaco text-center">
          Ao aceitar, você concorda com os termos da Capivara.
        </p>
      </div>
    </div>
  );
}

function friendlyError(code: string): string {
  switch (code) {
    case "invite_expired": return "Convite expirado.";
    case "invite_already_accepted": return "Você já aceitou esse convite.";
    case "email_mismatch": return "Email não bate com o convite.";
    case "invite_not_found": return "Convite não encontrado.";
    case "auth_required": return "Faça login primeiro.";
    default: return "Não deu pra aceitar. Tente novamente ou fale com quem te convidou.";
  }
}

function ShellMessage(props: {
  title: string;
  message: string;
  ctaHref?: string;
  ctaLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-cocoa">
          {props.title}
        </h1>
        <p className="text-tabaco">{props.message}</p>
        {props.ctaHref && props.ctaLabel ? (
          <div className="flex flex-col gap-2 items-center">
            <Link
              href={props.ctaHref}
              className="rounded-lg bg-saffron px-6 py-3 font-display font-semibold text-cocoa hover:brightness-95"
            >
              {props.ctaLabel}
            </Link>
            {props.secondaryHref && props.secondaryLabel ? (
              <Link
                href={props.secondaryHref}
                className="text-sm text-fur hover:underline"
              >
                {props.secondaryLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
