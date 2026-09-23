import type { createAdminClient } from "@/lib/supabase/admin";

/**
 * O cliente admin roda no schema `capivara`, nao no `public` — o tipo generico
 * de SupabaseClient nao encaixa. Derivar do proprio factory evita repetir os
 * cinco parametros do generico aqui.
 */
type ClienteAdmin = ReturnType<typeof createAdminClient>;

import {
  regraBlocklist,
  regraDocumentoDeTeste,
  regraAutoconsultaDivergente,
  regraVarreduraPorIp,
  decidir,
  mensagemDeBloqueio,
  type Acao,
  type Sinal,
} from "./regras";

export * from "./regras";

export interface ContextoAvaliacao {
  userId: string;
  targetNormalizado: string;
  finalidade: string;
  /** CPF do cadastro do usuario — pra checar autoconsulta. */
  documentoDoCadastro?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

export interface ResultadoAvaliacao {
  acao: Acao;
  sinais: Sinal[];
  /** Texto pro cliente quando acao === "bloquear". */
  mensagem?: string;
}

/**
 * Avalia uma consulta antes de cobrar.
 *
 * Complementa `capivara.check_fraud_rules` (velocidade por usuario, em SQL):
 * aqui entram blocklist, varredura por IP e coerencia da finalidade — os
 * casos que sobrevivem a criar uma conta nova.
 *
 * Nunca lanca: anti-fraude indisponivel nao pode derrubar a venda. Se a
 * consulta ao banco falhar, registra e libera (fail-open deliberado; o
 * check_fraud_rules em SQL continua valendo como segunda camada).
 */
export async function avaliarConsulta(
  admin: ClienteAdmin,
  ctx: ContextoAvaliacao
): Promise<ResultadoAvaliacao> {
  const sinais: Sinal[] = [];

  // Regras locais — nao custam ida ao banco
  const teste = regraDocumentoDeTeste(ctx.targetNormalizado);
  if (teste) sinais.push(teste);

  const autoconsulta = regraAutoconsultaDivergente(
    ctx.finalidade,
    ctx.targetNormalizado,
    ctx.documentoDoCadastro
  );
  if (autoconsulta) sinais.push(autoconsulta);

  // Uma ida ao banco pra blocklist + contagem por IP
  try {
    const { data, error } = await admin.rpc("fraude_sinais", {
      p_user_id: ctx.userId,
      p_target_normalized: ctx.targetNormalizado,
      p_ip: ctx.ip ?? null,
    });

    if (error) throw error;

    const s = (data ?? {}) as {
      bloqueado?: boolean;
      bloqueio_tipo?: string | null;
      bloqueio_motivo?: string | null;
      alvos_distintos_ip?: number;
    };

    if (s.bloqueado && s.bloqueio_tipo) {
      const bl = regraBlocklist({
        tipo: s.bloqueio_tipo,
        motivo: s.bloqueio_motivo ?? null,
      });
      if (bl) sinais.push(bl);
    }

    const varredura = regraVarreduraPorIp(s.alvos_distintos_ip ?? 0);
    if (varredura) sinais.push(varredura);
  } catch (e) {
    console.error("[anti-fraude] fraude_sinais falhou, liberando:", e);
  }

  const acao = decidir(sinais);

  // Registra o que foi visto. Sinal que nao vira alerta nao serve pra nada
  // depois — e' justamente o historico que mostra padrao.
  if (sinais.length > 0) {
    try {
      await admin.from("fraud_alerts").insert(
        sinais.map((s) => ({
          user_id: ctx.userId,
          rule_name: s.regra,
          severity: mapSeveridade(s.severidade),
          description: s.descricao,
          metadata: {
            ...s.metadata,
            finalidade: ctx.finalidade,
            user_agent: ctx.userAgent ?? null,
          },
          ip_address: ctx.ip ?? null,
          action_taken: s.acao === "bloquear" ? "block" : "flag",
        }))
      );
    } catch (e) {
      console.error("[anti-fraude] nao consegui gravar o alerta:", e);
    }
  }

  return {
    acao,
    sinais,
    mensagem: acao === "bloquear" ? mensagemDeBloqueio() : undefined,
  };
}

/** fraud_alerts.severity usa low/medium/high (schema de 0005). */
function mapSeveridade(s: Sinal["severidade"]): "low" | "medium" | "high" {
  if (s === "alta") return "high";
  if (s === "media") return "medium";
  return "low";
}
