import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  X,
  Minus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

export const metadata: Metadata = {
  title: "Comparativo: Capivara vs Serasa Experian vs Confirme Online vs Boa Vista",
  description:
    "Comparativo honesto entre Capivara e os principais bureaus de consulta de CPF, CNPJ e veicular do Brasil. Preço, UX, LGPD, API.",
  keywords: [
    "capivara vs serasa",
    "comparativo bureau credito",
    "confirme online preco",
    "boa vista consulta",
    "alternativa serasa",
  ],
  alternates: { canonical: `${SITE}/comparar` },
};

type CellValue = "yes" | "no" | "partial" | string;

interface Provider {
  name: string;
  highlight?: boolean;
  description: string;
}

interface ComparisonRow {
  feature: string;
  values: CellValue[]; // mesma ordem dos PROVIDERS
  detail?: string;
}

const PROVIDERS: Provider[] = [
  { name: "Capivara", highlight: true, description: "Plataforma moderna sem mensalidade" },
  { name: "Serasa Experian", description: "Bureau tradicional B2B" },
  { name: "Confirme Online", description: "Foco em imobiliárias" },
  { name: "Boa Vista", description: "Bureau tradicional, foco varejo" },
];

const COMPARISONS: ComparisonRow[] = [
  // PREÇO
  {
    feature: "Sem mensalidade",
    values: ["yes", "no", "no", "no"],
    detail: "Capivara cobra só por consulta. Concorrentes exigem mensalidade R$ 200+ mesmo sem uso.",
  },
  {
    feature: "Consulta avulsa < R$ 10",
    values: ["yes", "no", "no", "no"],
    detail: "Espiadinha CPF começa em R$ 9,90 na Capivara.",
  },
  {
    feature: "Sem fidelidade",
    values: ["yes", "no", "partial", "no"],
  },
  {
    feature: "Tabela de preços pública",
    values: ["yes", "no", "no", "no"],
    detail: "Concorrentes só revelam preço após contato comercial.",
  },

  // PRODUTO
  {
    feature: "Consulta CPF",
    values: ["yes", "yes", "yes", "yes"],
  },
  {
    feature: "Consulta CNPJ",
    values: ["yes", "yes", "yes", "yes"],
  },
  {
    feature: "Consulta veicular",
    values: ["yes", "yes", "no", "partial"],
  },
  {
    feature: "PDF assinado com QR Code",
    values: ["yes", "yes", "yes", "yes"],
  },
  {
    feature: "Cache automático 24h sem cobrar de novo",
    values: ["yes", "no", "no", "no"],
    detail: "Capivara não cobra consulta repetida em 24h. Concorrentes cobram cada vez.",
  },

  // INTEGRAÇÃO
  {
    feature: "API REST pública",
    values: ["yes", "yes", "partial", "partial"],
    detail: "Capivara tem API simples; concorrentes têm SOAP/complexo.",
  },
  {
    feature: "Webhooks HMAC",
    values: ["yes", "partial", "no", "no"],
  },
  {
    feature: "Idempotência via external_reference",
    values: ["yes", "no", "no", "no"],
  },
  {
    feature: "Documentação pública",
    values: ["yes", "partial", "no", "partial"],
  },

  // LGPD
  {
    feature: "Finalidade declarada por consulta",
    values: ["yes", "partial", "no", "partial"],
  },
  {
    feature: "Aceite com IP+hash gravado",
    values: ["yes", "no", "no", "no"],
    detail: "Capivara grava IP, user-agent, hash do termo aceito por consulta.",
  },
  {
    feature: "DPO/Encarregado visível no site",
    values: ["yes", "yes", "no", "yes"],
  },
  {
    feature: "Exportação LGPD self-service",
    values: ["yes", "partial", "no", "no"],
    detail: "Em /configuracoes você baixa JSON com todos os seus dados.",
  },
  {
    feature: "Anonimização automática após 90d",
    values: ["yes", "no", "no", "no"],
  },

  // UX
  {
    feature: "Cadastro em < 1 minuto",
    values: ["yes", "no", "partial", "partial"],
  },
  {
    feature: "Mobile-first",
    values: ["yes", "no", "no", "partial"],
  },
  {
    feature: "PWA (instalável)",
    values: ["yes", "no", "no", "no"],
  },
  {
    feature: "Pacote prepago B2B",
    values: ["yes", "no", "no", "no"],
    detail: "Manada Start (R$ 200 → 240 cr), Pro, Plus, Reserva.",
  },
];

const SECTIONS: { title: string; range: [number, number] }[] = [
  { title: "Preço & comercial", range: [0, 4] },
  { title: "Produto", range: [4, 9] },
  { title: "Integração", range: [9, 13] },
  { title: "LGPD & compliance", range: [13, 18] },
  { title: "UX & mobile", range: [18, 22] },
];

export default function CompararPage() {
  return (
    <div className="bg-paper">
      {/* HERO */}
      <section className="bg-paper-2 border-b border-line py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Badge variant="outline" className="mb-3 font-mono">
            Comparativo honesto
          </Badge>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-cocoa tracking-tight">
            Capivara vs concorrentes
          </h1>
          <p className="mt-4 text-lg text-tabaco max-w-2xl mx-auto">
            Comparamos lado a lado a Capivara com os principais bureaus
            tradicionais brasileiros. Sem fingir que somos perfeitos — os pontos
            onde eles ganham também estão aqui.
          </p>
          <p className="mt-3 text-xs font-mono text-tabaco/70">
            Atualizado em maio/2026. Sugestões de correção:{" "}
            <Link href="/contato" className="text-fur hover:underline">
              /contato
            </Link>
          </p>
        </div>
      </section>

      {/* HEADER DA TABELA */}
      <section className="sticky top-16 z-30 bg-paper-2/95 backdrop-blur border-b border-line">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
          <div className="grid grid-cols-[1.5fr_repeat(4,1fr)] gap-2 items-center text-xs">
            <div className="text-tabaco font-mono uppercase tracking-wider">
              Característica
            </div>
            {PROVIDERS.map((p) => (
              <div
                key={p.name}
                className={`text-center ${
                  p.highlight ? "rounded-md bg-fur text-cream px-2 py-1" : ""
                }`}
              >
                <p className="font-display font-bold text-sm">{p.name}</p>
                <p
                  className={`text-[10px] hidden md:block ${
                    p.highlight ? "text-cream/80" : "text-tabaco"
                  }`}
                >
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TABELA */}
      <section className="py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-xl font-bold text-cocoa mb-3 px-2">
                {section.title}
              </h2>
              <div className="rounded-xl border border-line bg-card overflow-hidden">
                {COMPARISONS.slice(section.range[0], section.range[1]).map((row, i) => (
                  <ComparisonRowItem key={row.feature} row={row} alt={i % 2 === 0} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CASOS ONDE NÃO SOMOS A MELHOR ESCOLHA */}
      <section className="py-12 bg-paper-2 border-y border-line">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Badge variant="outline" className="mb-3 font-mono">
            Honestidade brutal
          </Badge>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-cocoa mb-4">
            Quando NÃO escolher a Capivara
          </h2>
          <p className="text-tabaco mb-6">
            Não somos a melhor opção pra todo mundo. Casos onde concorrentes podem servir melhor:
          </p>
          <ul className="space-y-3 text-tabaco leading-relaxed">
            <li className="flex items-start gap-3">
              <X className="size-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cocoa">Você precisa de SLA contratual de 99.99% uptime.</strong>{" "}
                Nosso SLA é best-effort (sem garantia formal). Bancos grandes têm SLA bancário rigoroso.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <X className="size-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cocoa">Faz milhões de consultas por mês.</strong>{" "}
                Pra volumes massivos, contrato enterprise direto com Serasa/Boa Vista
                pode sair mais barato no preço por consulta. (Embora nossa Reserva Capivara
                tente cobrir isso.)
              </div>
            </li>
            <li className="flex items-start gap-3">
              <X className="size-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cocoa">Precisa de produtos super específicos.</strong>{" "}
                Score de fraude para emissão de cartão, modelo preditivo de churn,
                segmentação por classe social — esses são produtos especializados
                que bureaus tradicionais oferecem e nós não.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <X className="size-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cocoa">Tem contratos legados.</strong>{" "}
                Se sua empresa já paga mensalidade enorme com Confirme/Serasa há
                anos e tem fluxo automatizado, migrar tem custo. Faz mais sentido
                avaliar nossa API depois do próximo ciclo de renovação.
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="relative rounded-2xl bg-cocoa text-cream p-8 md:p-12 overflow-hidden text-center">
            <div className="absolute -top-20 -right-20 size-60 bg-saffron/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-60 bg-fur/30 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight">
                Faça você mesmo a comparação
              </h2>
              <p className="mt-3 text-cream/80 max-w-lg mx-auto">
                Crie conta grátis e faça sua primeira consulta. Sem cartão, sem
                fidelidade. Espiadinha CPF custa R$ 9,90.
              </p>
              <Button asChild variant="accent" size="xl" className="mt-6">
                <Link href="/consultar">
                  Começar agora
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ComparisonRowItem({ row, alt }: { row: ComparisonRow; alt?: boolean }) {
  return (
    <div
      className={`grid grid-cols-[1.5fr_repeat(4,1fr)] gap-2 items-center px-3 py-3 ${
        alt ? "bg-paper-2/30" : ""
      }`}
    >
      <div className="text-xs md:text-sm">
        <p className="text-cocoa font-medium">{row.feature}</p>
        {row.detail && (
          <p className="text-[10px] text-tabaco mt-0.5 leading-snug">{row.detail}</p>
        )}
      </div>
      {row.values.map((v, i) => (
        <div
          key={i}
          className={`flex justify-center text-center text-xs ${
            PROVIDERS[i].highlight ? "bg-fur/5" : ""
          }`}
        >
          <ValueCell value={v} highlight={PROVIDERS[i].highlight} />
        </div>
      ))}
    </div>
  );
}

function ValueCell({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  if (value === "yes") {
    return (
      <Check
        className={`size-5 ${highlight ? "text-fur" : "text-ok"}`}
      />
    );
  }
  if (value === "no") {
    return <X className="size-5 text-red-400" />;
  }
  if (value === "partial") {
    return <Minus className="size-5 text-saffron" />;
  }
  return <span className="font-mono text-xs text-cocoa">{value}</span>;
}
