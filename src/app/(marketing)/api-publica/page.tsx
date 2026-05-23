import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Book,
  Check,
  Code2,
  Layers,
  Lock,
  ShieldCheck,
  Webhook,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/capivara/mascot";
import {
  PACOTES_MANADA,
  PLANOS_CPF,
  PLANOS_CNPJ,
  PLANOS_VEICULAR,
  precoConsultaCentavos,
  type Plano,
} from "@/lib/consultas/planos";
import { formatBRL } from "@/lib/formatters";

// Pacote Master (maior, menor preco/consulta) e Start (menor, maior preco/consulta).
// Usados pra calcular o range "de R$X a R$Y por consulta".
const PACOTE_MAIOR = PACOTES_MANADA[PACOTES_MANADA.length - 1];
const PACOTE_MENOR = PACOTES_MANADA[0];

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://capivara-green.vercel.app";

export const metadata: Metadata = {
  title: "API Capivara · Consulta CPF, CNPJ e veicular via REST · Capivara",
  description:
    "Integre consultas de CPF, CNPJ e veicular direto no seu sistema. API REST com Bearer auth, idempotência, webhooks HMAC e cobrança em folhas (créditos prepagos). Sem mensalidade.",
  keywords: [
    "api consulta cpf",
    "api consulta cnpj",
    "api consulta veicular",
    "api capivara",
    "api background check brasil",
    "api crédito",
    "api fraude",
    "webhook lgpd",
  ],
  alternates: { canonical: `${SITE}/api-publica` },
  openGraph: {
    title: "API Capivara · Integração B2B",
    description:
      "Puxe capivaras direto do seu sistema. REST + webhooks HMAC + cobrança em folhas.",
    url: `${SITE}/api-publica`,
    type: "website",
  },
};

const FEATURES = [
  {
    icon: Lock,
    title: "Auth via Bearer token",
    description:
      "Chaves cap_live_… armazenadas em hash SHA-256. Revogue a qualquer momento sem refazer integração.",
  },
  {
    icon: Layers,
    title: "Idempotência nativa",
    description:
      "Envie external_reference próprio. Se reenviar a mesma requisição, devolvemos a consulta existente sem cobrar de novo.",
  },
  {
    icon: Webhook,
    title: "Webhooks HMAC",
    description:
      "Receba consultation.completed direto no seu sistema. Assinatura HMAC-SHA256 + retry exponencial 1m-24h.",
  },
  {
    icon: Bell,
    title: "Eventos em tempo real",
    description:
      "consultation.completed, consultation.failed, payment.confirmed. Você escolhe quais ouvir por endpoint.",
  },
  {
    icon: ShieldCheck,
    title: "LGPD operacional",
    description:
      "Toda chamada exige finalidade declarada. Logs de auditoria + anonimização automática após 90d.",
  },
  {
    icon: Zap,
    title: "Cache 24h gratuito",
    description:
      "Consultou o mesmo alvo + mesmo plano em 24h? Cache hit não cobra de novo. Manada Plus tem cache estendido 7d.",
  },
];

export default function APILandingPage() {
  // Tabela de preços por plano (custo em folhas + ref em R$ — pra B2C)
  const planosCpf = PLANOS_CPF;
  const planosCnpj = PLANOS_CNPJ;
  const planosVeic = PLANOS_VEICULAR;

  return (
    <div className="bg-paper">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 pb-12 md:pt-16 md:pb-20">
          <div className="grid items-center gap-8 md:gap-12 md:grid-cols-2">
            <div className="relative flex items-center justify-center min-h-[160px] md:min-h-[320px] md:order-2">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-saffron/15 via-transparent to-fur/10 blur-3xl" />
              <Mascot
                pose="heroico"
                size={420}
                animate="idle"
                className="drop-shadow-[0_25px_45px_rgba(31,22,17,0.18)] w-full max-w-[220px] sm:max-w-[320px] md:max-w-[420px] h-auto"
                priority
              />
            </div>

            <div className="space-y-4 md:space-y-6 text-center md:text-left md:order-1">
              <Badge variant="secondary" className="font-mono">
                <span className="text-fur mr-1.5">●</span> API REST · Cobrança em folhas
              </Badge>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-cocoa leading-[1.05]">
                Puxe capivaras direto do seu sistema.
              </h1>

              <p className="text-base sm:text-lg text-tabaco leading-relaxed max-w-xl mx-auto md:mx-0">
                CPF, CNPJ e veicular via REST. Auth por Bearer token, idempotência e
                webhooks HMAC. <strong className="text-cocoa">Cobrado por consulta</strong> —
                sem mensalidade, sem fidelidade.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center md:justify-start">
                <Button asChild variant="accent" size="xl">
                  <Link href="#precos">
                    Ver tabela de preços
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="xl">
                  <Link href="/docs/api">Ler a documentação</Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 pt-3 text-[11px] sm:text-xs font-mono text-tabaco/80">
                <span className="flex items-center gap-1.5">
                  <Code2 className="size-4 text-info" /> REST · JSON
                </span>
                <span className="flex items-center gap-1.5">
                  <Webhook className="size-4 text-saffron" /> Webhooks HMAC
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-ok" /> LGPD
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-paper-2 py-16 md:py-20 border-y border-line">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <Badge variant="outline" className="mb-3 font-mono">
              O que a API entrega
            </Badge>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cocoa leading-tight">
              Feito pra produção, não pra demo.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-line bg-card p-5 hover:shadow-md transition-shadow"
              >
                <div className="size-10 rounded-lg bg-fur/15 text-fur flex items-center justify-center mb-3">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-display font-semibold text-cocoa mb-1">{title}</h3>
                <p className="text-sm text-tabaco leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK START CODE */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <Badge variant="outline" className="mb-3 font-mono">
              Quick start
            </Badge>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cocoa leading-tight">
              Primeira chamada em 30 segundos
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-line bg-cocoa text-cream p-5 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto">
              <p className="text-saffron mb-2">{`// 1. Criar consulta CPF`}</p>
              <pre className="whitespace-pre">{`curl -X POST \\
  https://capivara.app/api/v1/consultations \\
  -H "Authorization: Bearer cap_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "plan_id": "cpf-investigacao",
    "target": "12345678900",
    "external_reference": "ticket-42"
  }'`}</pre>
            </div>

            <div className="rounded-xl border border-line bg-cocoa text-cream p-5 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto">
              <p className="text-saffron mb-2">{`// 2. Receber webhook quando ficar pronta`}</p>
              <pre className="whitespace-pre">{`POST /seu-endpoint
x-capivara-signature: t=1714...,v1=ab12...
x-capivara-event: consultation.completed

{
  "id": "evt_...",
  "type": "consultation.completed",
  "data": {
    "consultation_id": "...",
    "pdf_url": "https://...",
    "external_reference": "ticket-42"
  }
}`}</pre>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="accent" size="lg">
              <Link href="/api-publica/playground">
                Testar no Playground
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/docs/api">
                <Book className="size-4 mr-1" />
                Documentação completa
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TABELA DE PRECOS API */}
      <section id="precos" className="bg-paper-2 py-16 md:py-20 border-y border-line scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <Badge variant="outline" className="mb-3 font-mono">
              Preços API · R$ por consulta
            </Badge>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cocoa leading-tight">
              Você paga por consulta. Sem mensalidade.
            </h2>
            <p className="mt-3 text-tabaco">
              Cada consulta tem um preço fixo em R$. Quanto maior o pacote de
              créditos que você compra, mais barato fica o R$ por consulta. Veja
              os preços efetivos em cada faixa abaixo.
            </p>
          </div>

          {/* Tabela compacta — preco POR CONSULTA */}
          <div className="rounded-xl border border-line bg-card overflow-hidden">
            <PrecosTable titulo="CPF" planos={planosCpf} />
            <PrecosTable titulo="CNPJ" planos={planosCnpj} />
            <PrecosTable titulo="Veicular" planos={planosVeic} />
          </div>

          <p className="text-xs font-mono text-tabaco/70 mt-4 text-center">
            * Coluna <strong className="text-cocoa">"R$/consulta"</strong> mostra o
            preço efetivo no pacote menor (Start) e no maior (Reserva). Quanto
            mais consultas você compra, mais barato fica cada uma.
          </p>

          {/* Pacotes Manada */}
          <div className="mt-12">
            <h3 className="font-display text-xl font-bold text-cocoa mb-2">
              Pacotes de créditos (Manada)
            </h3>
            <p className="text-tabaco text-sm mb-6">
              Você compra um pacote uma vez, e usa os créditos quando quiser. Não
              expiram. Quanto maior o pacote, mais barato fica cada consulta.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PACOTES_MANADA.map((pacote) => {
                const refPlano = PLANOS_CPF[1]; // CPF Investigação como referência
                const refPreco = precoConsultaCentavos(refPlano, pacote);
                return (
                  <div
                    key={pacote.id}
                    className="rounded-xl border border-line bg-card p-5 flex flex-col"
                  >
                    <h4 className="font-display font-bold text-cocoa">{pacote.nome}</h4>
                    <p className="font-display text-2xl font-bold text-cocoa mt-2">
                      {formatBRL(pacote.valor_centavos)}
                    </p>
                    <p className="text-[11px] font-mono text-tabaco mt-1">
                      {pacote.folhasTotais} créditos ·{" "}
                      <span className="text-saffron">+{pacote.bonusPercent}% bônus</span>
                    </p>

                    <div className="mt-3 pt-3 border-t border-line/60">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-tabaco">
                        ref. CPF Investigação
                      </p>
                      <p className="font-mono text-sm text-cocoa mt-0.5">
                        <strong className="text-fur">{formatBRL(refPreco)}</strong>
                        <span className="text-tabaco/70 text-xs"> /consulta</span>
                      </p>
                    </div>

                    <ul className="mt-4 space-y-1 text-xs text-tabaco flex-1">
                      {pacote.recursos.map((r) => (
                        <li key={r} className="flex items-start gap-1.5">
                          <Check className="size-3 text-ok shrink-0 mt-0.5" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-xs font-mono text-tabaco/70 mt-6">
              Volume acima de 10k consultas/mês:{" "}
              <Link href="/contato" className="text-fur hover:underline">
                fale com a gente
              </Link>{" "}
              pra plano enterprise customizado.
            </p>
          </div>
        </div>
      </section>

      {/* COMO COBRAMOS */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <Badge variant="outline" className="mb-3 font-mono">
              Como funciona a cobrança
            </Badge>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cocoa leading-tight">
              Sem mensalidade, sem surpresa
            </h2>
          </div>

          <ol className="space-y-4 max-w-2xl">
            {[
              "Você compra um pacote Manada (créditos prepagos). Pagamento via PIX, boleto ou cartão. NF-e emitida no ato.",
              "Cada chamada da API debita o valor da consulta consultada (ex: CPF Investigação ~R$ 8,30 a R$ 10,00).",
              "Cache 24h: mesmo alvo + mesmo plano em 24h não cobra de novo (Manada Plus tem cache estendido pra 7 dias).",
              "Os créditos não expiram. Use quando precisar — campanha sazonal, picos de demanda, integração nova.",
              "Webhook avisa o seu sistema quando a consulta fica pronta. PDF assinado disponível por 7 dias na signed URL.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="shrink-0 size-8 rounded-full bg-cocoa text-cream flex items-center justify-center font-mono text-sm">
                  {i + 1}
                </span>
                <p className="text-sm md:text-base text-cocoa leading-relaxed pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 md:py-20 bg-paper-2 border-t border-line">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="relative rounded-2xl bg-cocoa text-cream p-8 md:p-12 overflow-hidden text-center">
            <div className="absolute -top-20 -right-20 size-60 bg-saffron/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-60 bg-fur/30 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight">
                Comece grátis. Pague só o que usar.
              </h2>
              <p className="mt-3 text-cream/80 max-w-lg mx-auto">
                Crie sua conta empresa, cadastre a chave da API, e mande sua primeira chamada hoje.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="accent" size="xl">
                  <Link href="/cadastro?tipo=empresa">
                    Criar conta empresa
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="xl">
                  <Link href="/docs/api">Ver documentação</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PrecosTable({
  titulo,
  planos,
}: {
  titulo: string;
  planos: Plano[];
}) {
  return (
    <div className="border-b border-line/60 last:border-b-0">
      <div className="bg-paper-2/60 px-5 py-3 text-xs font-mono uppercase tracking-wider text-tabaco">
        {titulo}
      </div>
      <table className="w-full text-sm">
        <thead className="text-xs font-mono uppercase tracking-wider text-tabaco">
          <tr className="border-b border-line/60">
            <th className="text-left px-5 py-3">Plano</th>
            <th className="text-left px-5 py-3 hidden md:table-cell">Descrição</th>
            <th className="text-right px-5 py-3 whitespace-nowrap">R$ / consulta (API)</th>
            <th className="text-right px-5 py-3 hidden sm:table-cell whitespace-nowrap">Avulso (B2C)</th>
          </tr>
        </thead>
        <tbody>
          {planos.map((p) => {
            const max = precoConsultaCentavos(p, PACOTE_MENOR); // Start - mais caro
            const min = precoConsultaCentavos(p, PACOTE_MAIOR); // Master - mais barato
            return (
              <tr key={p.id} className="border-b border-line/40 last:border-b-0">
                <td className="px-5 py-3 font-medium text-cocoa">{p.nome}</td>
                <td className="px-5 py-3 text-tabaco hidden md:table-cell max-w-md">
                  <span className="line-clamp-1">{p.descricao}</span>
                </td>
                <td className="px-5 py-3 text-right font-mono whitespace-nowrap">
                  <strong className="text-fur">{formatBRL(min)}</strong>
                  <span className="text-tabaco/70 text-xs"> a </span>
                  <span className="text-tabaco">{formatBRL(max)}</span>
                </td>
                <td className="px-5 py-3 text-right font-mono text-xs text-tabaco hidden sm:table-cell">
                  {formatBRL(p.precoB2C_centavos)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
