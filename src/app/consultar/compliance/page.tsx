import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Landmark,
  Building2,
  Scale,
  ArrowRight,
  Code2,
} from "lucide-react";

import { ProdutoAvulsoCard } from "@/components/consulta/produto-avulso-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/capivara/mascot";
import { PRODUTOS_COMPLIANCE } from "@/lib/consultas/planos";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

export const metadata: Metadata = {
  title: "KYC, PLD e Radar Jurídico · Compliance de pessoa e empresa · Capivara",
  description:
    "Checagem de integridade antes de aceitar cliente ou fornecedor: PEP, sanções, mandados, óbito, processos, protestos e CADIN. KYC completo a partir de R$ 39,90, com API pra automatizar.",
  keywords: [
    "kyc",
    "pld",
    "prevenção à lavagem de dinheiro",
    "consulta pep",
    "pessoa exposta politicamente",
    "compliance fornecedor",
    "due diligence",
    "protesto nacional",
    "cadin",
    "background check",
    "capivara compliance",
  ],
  alternates: { canonical: `${SITE}/consultar/compliance` },
  openGraph: {
    title: "KYC, PLD e Radar Jurídico · Capivara",
    description:
      "PEP, sanções, mandados, óbito, processos e protestos. Onboarding seguro em segundos.",
    url: `${SITE}/consultar/compliance`,
    type: "website",
    images: [{ url: `${SITE}/og.png`, width: 1200, height: 630 }],
  },
};

const KYC = PRODUTOS_COMPLIANCE.filter((p) => p.id.startsWith("compliance-kyc"));
const PLD = PRODUTOS_COMPLIANCE.filter((p) => p.id.startsWith("compliance-pld"));
const JURIDICO = PRODUTOS_COMPLIANCE.filter((p) => p.id.startsWith("juridico-"));

const PUBLICO = [
  {
    icon: Landmark,
    title: "Fintech e meios de pagamento",
    description:
      "PLD é obrigação regulatória. Rode PEP, sanções e óbito no onboarding — e guarde o PDF como evidência.",
  },
  {
    icon: Building2,
    title: "Compras e fornecedores",
    description:
      "Antes de homologar: sanções, processos, protestos e a situação dos sócios da empresa.",
  },
  {
    icon: ShieldCheck,
    title: "Imobiliária e locação",
    description:
      "Inquilino com mandado em aberto ou CPF de falecido? Checagem em segundos antes de assinar.",
  },
  {
    icon: Scale,
    title: "Advocacia e crédito",
    description:
      "Radar Jurídico reúne processos, protesto, CADIN e dívida ativa num relatório só.",
  },
];

function Grupo({
  titulo,
  descricao,
  produtos,
  badge,
}: {
  titulo: string;
  descricao?: string;
  produtos: typeof PRODUTOS_COMPLIANCE;
  badge?: string;
}) {
  if (produtos.length === 0) return null;
  return (
    <section className="pb-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-7">
          {badge ? (
            <Badge variant="outline" className="mb-3 font-mono">
              {badge}
            </Badge>
          ) : null}
          <h2 className="font-display text-2xl md:text-3xl font-bold text-cocoa">
            {titulo}
          </h2>
          {descricao ? (
            <p className="mt-2 text-tabaco max-w-2xl mx-auto">{descricao}</p>
          ) : null}
        </div>
        <div className="grid gap-4">
          {produtos.map((produto) => (
            <ProdutoAvulsoCard key={produto.id} produto={produto} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CompliancePage() {
  return (
    <div className="bg-paper">
      {/* Hero */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-4">
            <Mascot pose="investigando" size={96} animate="idle" />
          </div>
          <Badge variant="outline" className="mb-3 font-mono">
            Compliance · KYC · Jurídico
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-cocoa">
            Saiba com quem você está fechando negócio.
          </h1>
          <p className="mt-4 text-tabaco text-lg leading-relaxed">
            PEP, sanções, mandados em aberto, óbito, processos, protestos e dívidas
            com a União. A checagem que evita o prejuízo — e o PDF que comprova que
            você fez a checagem.
          </p>
        </div>
      </section>

      <Grupo
        badge="Onboarding"
        titulo="KYC — a checagem completa"
        descricao="O pacote que fintech, imobiliária e compras rodam antes de aceitar alguém."
        produtos={KYC}
      />

      <Grupo
        badge="Regulatório"
        titulo="PLD / PEP isolado"
        descricao="Pra quem já tem o resto do onboarding e só precisa da parte regulada."
        produtos={PLD}
      />

      <Grupo
        badge="Jurídico"
        titulo="Processos, protestos e dívidas"
        produtos={JURIDICO}
      />

      {/* Público */}
      <section className="py-14 bg-paper-2 border-t border-line">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-cocoa text-center mb-8">
            Quem precisa checar antes de aceitar
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PUBLICO.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-lg border border-line bg-card p-5 flex items-start gap-4"
              >
                <div className="size-11 rounded-md bg-cream flex items-center justify-center text-fur shrink-0">
                  <Icon className="size-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-cocoa">{title}</h3>
                  <p className="text-sm text-tabaco mt-1 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API cross-sell — canal natural do compliance */}
      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-lg bg-cocoa text-cream p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-saffron font-mono text-xs uppercase tracking-widest mb-2">
                <Code2 className="size-4" />
                Automatize no seu fluxo
              </div>
              <h3 className="font-display text-2xl font-bold leading-tight">
                Compliance não é consulta avulsa. É rotina.
              </h3>
              <p className="mt-2 text-cream/80 max-w-xl leading-relaxed">
                Chame a mesma checagem pela API no momento do cadastro, debitando do
                saldo da empresa. Webhook avisa quando o relatório fica pronto.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Button asChild variant="accent" size="lg">
                <Link href="/api-publica">
                  Ver a API
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-cream hover:bg-cream/10">
                <Link href="/empresas">Planos empresa</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
