import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  CreditCard,
  FileText,
  ShieldCheck,
  Database,
  Lock,
  Zap,
  Clock,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/capivara/mascot";

export const metadata: Metadata = {
  title: "Como funciona · Capivara",
  description:
    "Em 3 passos: escolha o plano, pague com PIX e receba o relatório. Entenda como a Capivara conecta as melhores bases de dados do Brasil.",
};

export default function ComoFuncionaPage() {
  return (
    <div className="bg-paper">
      <HeroComoFunciona />
      <TresPassos />
      <Bases />
      <Garantias />
      <CTAFinal />
    </div>
  );
}

function HeroComoFunciona() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <Badge variant="outline" className="mb-3 font-mono">
          Como funciona
        </Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-cocoa">
          Três telas, sem atrito.
        </h1>
        <p className="mt-4 text-tabaco text-lg leading-relaxed">
          Da primeira vez até o PDF na sua mão em menos de um minuto.
        </p>
      </div>
    </section>
  );
}

const PASSOS = [
  {
    n: "01",
    icon: Search,
    title: "Escolha o plano e digite o dado",
    description:
      "Selecione CPF, CNPJ ou placa. Escolha um dos 5 planos por categoria, do mais leve (Espiadinha) ao Raio-X. Digite o número e declare a finalidade conforme a LGPD.",
    bullets: [
      "Formatação automática do CPF/CNPJ/placa",
      "Validação de dígitos verificadores antes de cobrar",
      "Finalidade obrigatória (compliance LGPD)",
    ],
  },
  {
    n: "02",
    icon: CreditCard,
    title: "Pague com PIX, boleto ou cartão",
    description:
      "PIX é instantâneo. Boleto leva até 2 dias úteis. Cartão à vista (sem parcelamento). Recibo gerado no ato.",
    bullets: [
      "PIX confirma em segundos",
      "Sem mensalidade, sem renovação automática",
      "Recibo baixável de cada pagamento",
    ],
  },
  {
    n: "03",
    icon: FileText,
    title: "Receba o relatório em PDF",
    description:
      "Nosso sistema consulta as bases em paralelo e gera um PDF assinado em até 1 minuto. Disponível na sua conta por 90 dias. QR Code de verificação de autenticidade.",
    bullets: [
      "PDF baixável, compartilhável e verificável",
      "Histórico fica salvo na sua conta",
      "Cache 24h: consultou de novo? Não cobra.",
    ],
  },
];

function TresPassos() {
  return (
    <section className="py-12 md:py-16 bg-paper-2 border-y border-line">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-16">
        {PASSOS.map(({ n, icon: Icon, title, description, bullets }, i) => (
          <div key={n} className="grid items-center gap-10 md:grid-cols-2">
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <span className="font-mono text-xs tracking-widest text-tabaco/70">
                PASSO {n}
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold text-cocoa">
                {title}
              </h2>
              <p className="mt-3 text-tabaco leading-relaxed">{description}</p>

              <ul className="mt-5 space-y-2">
                {bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-cocoa"
                  >
                    <span className="size-1.5 rounded-full bg-fur mt-2 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`flex justify-center ${i % 2 === 1 ? "md:order-1" : ""}`}>
              <div className="relative size-48 md:size-64 rounded-2xl bg-cream/60 border border-line flex items-center justify-center">
                <Icon className="size-20 md:size-24 text-cocoa" strokeWidth={1.5} />
                <span className="absolute -top-3 -left-3 size-12 rounded-full bg-cocoa text-cream flex items-center justify-center font-display font-bold text-lg">
                  {n}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const BASES = [
  "Serasa Premium",
  "SPC Brasil",
  "Boa Vista",
  "SCR BACEN",
  "QUOD",
  "Receita Federal",
  "Certidões Trabalhistas",
  "RENAJUD",
  "BIN Nacional e Estadual",
  "RENAINF",
  "Cenprot",
  "DETRAN (laudo CRLV)",
];

function Bases() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="outline" className="mb-3 font-mono">
            Bases conectadas
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
            Dados oficiais, consultados em tempo real.
          </h2>
          <p className="mt-3 text-tabaco">
            A Capivara é uma camada de orquestração. Não armazenamos dados de
            terceiros. Cada consulta busca direto na fonte autorizada.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {BASES.map((b) => (
            <Badge key={b} variant="secondary" className="text-sm py-1.5 px-3 font-sans">
              <Database className="size-3.5 mr-1.5 text-fur" />
              {b}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}

const GARANTIAS = [
  {
    icon: ShieldCheck,
    title: "100% LGPD",
    description:
      "Toda consulta exige declaração de finalidade. Dados não armazenados após 90 dias. Direitos do titular implementados.",
  },
  {
    icon: Lock,
    title: "Privacidade total",
    description:
      "Suas consultas são privadas. Outros usuários não veem o que você puxa. Equipe B2B tem permissões granulares.",
  },
  {
    icon: Zap,
    title: "Velocidade real",
    description:
      "Maioria dos planos retorna em até 30 segundos. Raio-X (mais completo) leva até 2 minutos.",
  },
  {
    icon: Clock,
    title: "Cache transparente",
    description:
      "Repetiu a mesma consulta em 24h? Não cobra de novo. Empresas têm cache estendido (até 7 dias).",
  },
];

function Garantias() {
  return (
    <section className="py-20 bg-paper-2 border-y border-line">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 font-mono">
            Compromissos
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
            Quatro garantias que estão no código.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {GARANTIAS.map(({ icon: Icon, title, description }) => (
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

function CTAFinal() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center gap-8 rounded-2xl bg-cocoa text-cream p-8 md:p-10">
          <Mascot pose="concluido" size={100} animate="idle" />
          <div className="text-center md:text-left flex-1">
            <h2 className="font-display text-2xl md:text-3xl font-bold">
              Pronto pra puxar a primeira capivara?
            </h2>
            <p className="mt-2 text-cream/80">
              Comece pela Espiadinha (R$ 9,90) e veja o sistema funcionando.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3 items-center justify-center md:justify-start">
              <Button asChild variant="accent" size="lg">
                <Link href="/consultar">
                  Começar agora
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Link
                href="/precos"
                className="text-sm font-mono text-cream/70 hover:text-saffron transition-colors"
              >
                Ver todos os planos →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
