import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Code2,
  Webhook,
  FileSpreadsheet,
  Receipt,
  Headphones,
  Car,
  Briefcase,
  Building,
  Scale,
  Home,
  CreditCard,
  ArrowRight,
  Check,
  TrendingDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/capivara/mascot";
import { ManadaCarousel } from "@/components/consulta/manada-carousel";
import {
  PACOTES_MANADA,
  findPlano,
  descontoB2BPercent,
} from "@/lib/consultas/planos";
import { formatBRL } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Capivara para empresas · Manada",
  description:
    "Lojas de carro, despachantes, financeiras, advogados, RH e imobiliárias. Recarregue saldo em R$ com até 50% de bônus e tenha API, equipe e recibos.",
};

export default function EmpresasPage() {
  return (
    <div className="bg-paper">
      <HeroEmpresas />
      <QuemUsa />
      <RecursosPJ />
      <PacotesResumo />
      <ComparativoEconomia />
      <CTAVendas />
    </div>
  );
}

function HeroEmpresas() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-5">
            <Badge variant="secondary" className="font-mono">
              <Users className="size-3 mr-1.5" /> Para empresas
            </Badge>

            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-cocoa leading-[1.05]">
              Sua manada de consultas,
              <br />
              <span className="text-fur">com até 50% de bônus.</span>
            </h1>

            <p className="text-lg text-tabaco leading-relaxed max-w-xl">
              Recarregue saldo em R$ e consuma conforme uso. Sem
              mensalidade. Multi-usuário, API REST e webhooks inclusos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild variant="accent" size="xl">
                <Link href="/cadastro?tipo=empresa">
                  Criar conta empresarial
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="xl">
                <Link href="/contato?tipo=enterprise">Falar com vendas</Link>
              </Button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-saffron/15 via-transparent to-fur/10 blur-3xl" />
            <Mascot pose="heroico" size={320} animate="idle" priority />
          </div>
        </div>
      </div>
    </section>
  );
}

const SEGMENTOS = [
  {
    icon: Car,
    title: "Lojas de veículos",
    description: "Consulta antes de comprar/vender. Gravame, leilão, recall.",
  },
  {
    icon: Briefcase,
    title: "Despachantes",
    description: "Veicular + CRLV em massa. Cache estendido pra agilidade.",
  },
  {
    icon: Building,
    title: "Financeiras",
    description: "CPF + Score + SCR BACEN antes da concessão de crédito.",
  },
  {
    icon: Scale,
    title: "Advogados",
    description: "CPF + CNPJ + Certidão Trabalhista em processos.",
  },
  {
    icon: Users,
    title: "RH e contratação",
    description: "Verificação de candidatos com finalidade declarada.",
  },
  {
    icon: Home,
    title: "Imobiliárias",
    description: "Análise de inquilino antes da assinatura do contrato.",
  },
];

function QuemUsa() {
  return (
    <section className="py-20 bg-paper-2 border-y border-line">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 font-mono">
            Quem já usa
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
            Empresas que tomam decisão baseada em histórico.
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SEGMENTOS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-lg border border-line bg-card p-6 hover:border-fur/40 transition-colors"
            >
              <div className="size-12 rounded-md bg-cream flex items-center justify-center text-fur mb-4">
                <Icon className="size-6" strokeWidth={2} />
              </div>
              <h3 className="font-display text-lg font-bold text-cocoa mb-1">
                {title}
              </h3>
              <p className="text-sm text-tabaco leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const RECURSOS = [
  {
    icon: Users,
    title: "Multi-usuário",
    description:
      "Até 25 membros com permissões granulares (admin, operador, visualizador). Centro de custo por usuário.",
  },
  {
    icon: Code2,
    title: "API REST",
    description:
      "Integre direto com seu CRM, ERP ou sistema interno. Documentação interativa, rate limiting transparente.",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description:
      "Receba notificações em tempo real: consulta concluída, saldo baixo, erro. Retry automático com assinatura.",
  },
  {
    icon: FileSpreadsheet,
    title: "Exportação em massa",
    description:
      "CSV, Excel, PDF. Relatórios de consumo por período, usuário, categoria, centro de custo.",
  },
  {
    icon: Receipt,
    title: "Recibo por recarga",
    description:
      "Toda recarga gera recibo baixável em PDF, enviado pro e-mail de cobrança da empresa.",
  },
  {
    icon: Headphones,
    title: "Suporte priorit. + SLA",
    description:
      "Plus e Master têm WhatsApp dedicado. Reserva Capivara inclui account manager.",
  },
];

function RecursosPJ() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 font-mono">
            Recursos
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
            Pensado para volume e equipe.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {RECURSOS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-lg border border-line bg-card p-6">
              <div className="size-12 rounded-md bg-cream flex items-center justify-center text-fur mb-4">
                <Icon className="size-6" strokeWidth={2} />
              </div>
              <h3 className="font-display text-lg font-bold text-cocoa mb-2">
                {title}
              </h3>
              <p className="text-sm text-tabaco leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PacotesResumo() {
  return (
    <section className="py-20 bg-paper-2 border-y border-line">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 font-mono">
            Pacotes Manada
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
            Quanto maior o pacote, maior o bônus.
          </h2>
          <p className="mt-3 text-tabaco">
            Sem mensalidade. Saldo não vence em até 12 meses (renova com recarga).
          </p>
        </div>

        <ManadaCarousel pacotes={PACOTES_MANADA} fadeColor="paper-2" />

        <div className="text-center mt-8">
          <Link
            href="/precos"
            className="text-sm text-fur underline-offset-4 hover:underline font-medium"
          >
            Ver tabela completa de consumo →
          </Link>
        </div>
      </div>
    </section>
  );
}

function ComparativoEconomia() {
  // Planos de referencia (preco B2B vs B2C). Mantem ids alinhados com planos.ts.
  const samples = [
    { id: "cpf-avancada", label: "CPF Avançada" },
    { id: "veicular-total", label: "Veicular Total" },
    { id: "cnpj-premium", label: "CNPJ Premium" },
  ];
  const planos = samples
    .map((s) => ({ ...s, plano: findPlano(s.id) }))
    .filter((s) => s.plano);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-2xl bg-card border border-line p-8 md:p-12">
          <div className="text-center mb-10">
            <Badge variant="ok" className="mb-3">
              <TrendingDown className="size-3 mr-1.5" /> Economia real
            </Badge>
            <h2 className="font-display text-3xl font-bold text-cocoa">
              Até 50% mais barato que avulso.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 text-center">
            {planos.map(({ id, label, plano }) => {
              const desconto = descontoB2BPercent(plano!);
              return (
                <div key={id}>
                  <div className="font-mono text-xs text-tabaco mb-1">{label}</div>
                  <div className="font-display text-2xl font-bold text-cocoa line-through opacity-50">
                    {formatBRL(plano!.precoB2C_centavos)}
                  </div>
                  <div className="text-xs text-tabaco mt-1">Avulso B2C</div>
                  <div className="font-display text-2xl font-bold text-fur mt-2">
                    {formatBRL(plano!.precoB2B_centavos)}
                  </div>
                  <div className="text-xs text-ok mt-1">B2B (-{desconto}%)</div>
                </div>
              );
            })}
          </div>

          <p className="text-center mt-8 text-xs text-tabaco/70 font-mono">
            * Preço B2B debitado do saldo da empresa. Bônus de pacote Manada
            estica ainda mais o saldo (até +50%).
          </p>
        </div>
      </div>
    </section>
  );
}

function CTAVendas() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl bg-cocoa text-cream p-10 md:p-14 text-center">
          <div className="flex justify-center mb-6">
            <Mascot pose="padrao" size={100} animate="idle" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Pronto para começar?
          </h2>
          <p className="mt-3 text-cream/80 max-w-xl mx-auto leading-relaxed">
            Crie sua conta empresarial em 2 minutos. Sem cobrança até você decidir
            recarregar seu saldo.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Button asChild variant="accent" size="xl">
              <Link href="/cadastro?tipo=empresa">
                Criar conta empresarial
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Link
              href="/contato?tipo=enterprise"
              className="text-sm font-mono text-cream/70 hover:text-saffron transition-colors"
            >
              Tenho mais de 5.000 consultas/mês →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
