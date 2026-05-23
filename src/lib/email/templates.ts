/**
 * Templates de email — HTML inline.
 *
 * Mantém paleta Cerrado e visual brand. Compatível com clientes restritivos
 * (Gmail, Outlook) — apenas tabelas, inline styles e cores hex.
 */

const C = {
  cocoa: "#1F1611",
  fur: "#C46A3F",
  tabaco: "#8E4628",
  saffron: "#E8A547",
  cream: "#F4EAD8",
  paper: "#FBF6EC",
  line: "#E6D8BD",
  ok: "#5E7C4F",
};

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

function shell(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:${C.paper};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${C.cocoa};">
  ${preheader ? `<div style="display:none;font-size:1px;color:${C.paper};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>` : ""}
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${C.paper};padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;background:#FFFCF5;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(31,22,17,0.08);">
        <!-- Header brand -->
        <tr><td style="background:${C.cocoa};padding:24px 32px;color:${C.cream};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="font-size:20px;font-weight:700;color:${C.cream};letter-spacing:-0.5px;">capivara</td>
              <td align="right" style="font-size:10px;color:${C.cream};opacity:0.7;letter-spacing:1.5px;">PUXE ANTES DE FECHAR</td>
            </tr>
          </table>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:${C.cream};padding:20px 32px;text-align:center;font-size:11px;color:${C.tabaco};">
          <p style="margin:0 0 8px 0;">Capivara — Dose de Growth · <a href="${BASE}" style="color:${C.fur};text-decoration:none;">suacapivara.com.br</a></p>
          <p style="margin:0;font-size:10px;opacity:0.7;">
            <a href="${BASE}/lgpd" style="color:${C.tabaco};text-decoration:none;">Privacidade</a> ·
            <a href="${BASE}/contato" style="color:${C.tabaco};text-decoration:none;">Suporte</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function button(href: string, label: string, color: "cocoa" | "saffron" = "cocoa") {
  const bg = color === "saffron" ? C.saffron : C.cocoa;
  const text = color === "saffron" ? C.cocoa : C.cream;
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;">
    <tr><td style="background:${bg};border-radius:8px;">
      <a href="${href}" style="display:inline-block;padding:14px 28px;color:${text};text-decoration:none;font-weight:600;font-size:14px;">${label}</a>
    </td></tr>
  </table>`;
}

// ============================================================
// Templates
// ============================================================

export function emailBoasVindas(params: { nome: string }): { subject: string; html: string } {
  const subject = `Bem-vinda à manada, ${params.nome.split(" ")[0]} 🐾`;
  const html = shell(
    `
    <h1 style="font-size:24px;font-weight:700;color:${C.cocoa};margin:0 0 12px 0;letter-spacing:-0.5px;">
      Bem-vinda à manada!
    </h1>
    <p style="font-size:15px;line-height:1.6;color:${C.cocoa};margin:0 0 16px 0;">
      Oi <strong>${params.nome.split(" ")[0]}</strong>, sua conta na Capivara está pronta. Agora você pode puxar capivaras sempre que precisar verificar uma pessoa, empresa ou veículo antes de fechar negócio.
    </p>
    <p style="font-size:15px;line-height:1.6;color:${C.cocoa};margin:0 0 8px 0;">
      <strong>Algumas coisas pra começar:</strong>
    </p>
    <ul style="font-size:14px;line-height:1.7;color:${C.tabaco};margin:0 0 20px 0;padding-left:20px;">
      <li>Sem mensalidade — você só paga as consultas que fizer</li>
      <li>5 planos por categoria, do mais leve (R$ 9,90) ao Raio-X completo</li>
      <li>Resultados em PDF, com QR Code de verificação</li>
      <li>Cache 24h: consultar o mesmo CPF de novo no mesmo dia não cobra</li>
    </ul>
    ${button(`${BASE}/consultar`, "Puxar minha primeira capivara", "saffron")}
    <p style="font-size:12px;color:${C.tabaco};margin-top:24px;">
      Qualquer dúvida, responde esse email ou fala com a gente em <a href="${BASE}/contato" style="color:${C.fur};">suacapivara.com.br/contato</a>.
    </p>
    `,
    "Sua conta na Capivara está pronta. Bora puxar?"
  );
  return { subject, html };
}

export function emailConsultaPronta(params: {
  nome: string;
  categoria: "CPF" | "CNPJ" | "Veicular";
  target: string;
  plano: string;
  consultationId: string;
  pdfUrl?: string;
}): { subject: string; html: string } {
  const subject = `Sua capivara ${params.categoria} está pronta`;
  const html = shell(
    `
    <h1 style="font-size:22px;font-weight:700;color:${C.cocoa};margin:0 0 12px 0;letter-spacing:-0.5px;">
      Sua consulta está pronta 🐾
    </h1>
    <p style="font-size:15px;line-height:1.6;color:${C.cocoa};margin:0 0 20px 0;">
      Oi <strong>${params.nome.split(" ")[0]}</strong>, terminei de puxar a capivara que você pediu.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${C.paper};border-left:3px solid ${C.fur};border-radius:6px;margin:20px 0;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 4px 0;font-size:10px;color:${C.tabaco};letter-spacing:1.5px;text-transform:uppercase;">${params.categoria.toUpperCase()} CONSULTADO</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:${C.cocoa};font-family:monospace;letter-spacing:1px;">${params.target}</p>
        <p style="margin:8px 0 0 0;font-size:11px;color:${C.tabaco};">Plano: <strong>${params.plano}</strong></p>
      </td></tr>
    </table>
    <p style="font-size:14px;line-height:1.6;color:${C.cocoa};margin:0 0 8px 0;">
      Você pode <strong>baixar o PDF</strong> agora ou abrir o resultado direto no painel.
    </p>
    ${button(`${BASE}/historico/${params.consultationId}`, "Abrir relatório", "saffron")}
    ${params.pdfUrl ? `<p style="font-size:12px;color:${C.tabaco};margin:12px 0;">PDF direto: <a href="${params.pdfUrl}" style="color:${C.fur};">${params.pdfUrl}</a></p>` : ""}
    <p style="font-size:11px;color:${C.tabaco};margin-top:24px;border-top:1px solid ${C.line};padding-top:16px;">
      ID do relatório: <code style="font-family:monospace;color:${C.cocoa};">${params.consultationId.slice(0, 8).toUpperCase()}</code> · Válido por 90 dias.
    </p>
    `,
    `Sua consulta ${params.categoria} foi concluída. PDF disponível.`
  );
  return { subject, html };
}

export function emailPagamentoAguardando(params: {
  nome: string;
  categoria: "CPF" | "CNPJ" | "Veicular";
  target: string;
  valor: string;
  consultationId: string;
}): { subject: string; html: string } {
  const subject = `Pagamento aguardando — ${params.categoria}`;
  const html = shell(
    `
    <h1 style="font-size:22px;font-weight:700;color:${C.cocoa};margin:0 0 12px 0;">
      Pagamento aguardando
    </h1>
    <p style="font-size:15px;line-height:1.6;color:${C.cocoa};margin:0 0 16px 0;">
      Oi <strong>${params.nome.split(" ")[0]}</strong>, criamos a cobrança para sua consulta. Assim que o pagamento for confirmado, processamos automaticamente.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${C.paper};border-radius:6px;margin:16px 0;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 8px 0;font-size:11px;color:${C.tabaco};">Valor</p>
        <p style="margin:0;font-size:22px;font-weight:700;color:${C.cocoa};">${params.valor}</p>
        <p style="margin:8px 0 0 0;font-size:11px;color:${C.tabaco};">Alvo: <code style="font-family:monospace;">${params.target}</code></p>
      </td></tr>
    </table>
    ${button(`${BASE}/consultar/aguardando/${params.consultationId}`, "Ver QR Code do PIX", "saffron")}
    `,
    `Cobrança gerada para sua consulta ${params.categoria}.`
  );
  return { subject, html };
}

export function emailSaldoBaixo(params: {
  nomeEmpresa: string;
  saldoAtual: number;
}): { subject: string; html: string } {
  const subject = `⚠ Saldo de créditos baixo — ${params.nomeEmpresa}`;
  const html = shell(
    `
    <h1 style="font-size:22px;font-weight:700;color:${C.cocoa};margin:0 0 12px 0;">
      Saldo de créditos baixo
    </h1>
    <p style="font-size:15px;line-height:1.6;color:${C.cocoa};margin:0 0 16px 0;">
      A empresa <strong>${params.nomeEmpresa}</strong> tem apenas <strong>${params.saldoAtual} créditos</strong> restantes. Recarregue para não interromper as consultas.
    </p>
    ${button(`${BASE}/empresa/creditos`, "Recarregar agora", "saffron")}
    `,
    `Sua empresa está com ${params.saldoAtual} créditos restantes.`
  );
  return { subject, html };
}
