import Link from "next/link";
import {
  ArrowRight,
  CarFront,
  Building2,
  UserRound,
  ShieldCheck,
  Zap,
  FileText,
  Search,
  Sparkles,
  Lock,
} from "lucide-react";

import { Mascot } from "@/components/capivara/mascot";
import { HeroMascot } from "@/components/capivara/hero-mascot";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanCard } from "@/components/consulta/plan-card";
import { PLANOS_CPF, PLANOS_VEICULAR } from "@/lib/consultas/planos";

export default function Home() {
  return (
    <>
      <Hero />
      <Categorias />
      <ComoFunciona />
      <CasosDeUso />
      <PlanosDestaque />
      <FAQ />
      <CTAFinal />
    </>
  );
}

// =========================================================================
// Hero
// =========================================================================

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 pb-8 sm:pt-8 sm:pb-10 md:pt-16 md:pb-16">
        <div className="grid items-center gap-4 sm:gap-8 md:gap-12 md:grid-cols-2">
          {/* Mascote no MOBILE aparece primeiro (centralizado, menor); em desktop fica na direita */}
          <div className="relative flex items-center justify-center min-h-[140px] sm:min-h-[220px] md:min-h-[340px] md:order-2">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-saffron/15 via-transparent to-fur/10 blur-3xl" />
            <HeroMascot
              width={520}
              className="drop-shadow-[0_25px_45px_rgba(31,22,17,0.18)] w-full max-w-[200px] sm:max-w-[320px] md:max-w-[520px] h-auto"
            />
          </div>

          <div className="space-y-3 sm:space-y-5 md:space-y-6 text-center md:text-left md:order-1">
            <Badge variant="secondary" className="font-mono">
              <span className="text-fur mr-1.5">●</span> Sem mensalidade, sem cadastro complicado
            </Badge>

            <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-cocoa leading-[1.05]">
              Puxe a capivara antes de fechar negócio.
            </h1>

            <p className="text-sm sm:text-lg md:text-xl text-tabaco leading-relaxed max-w-xl mx-auto md:mx-0">
              Consulta rápida e completa de histórico de qualquer{" "}
              <strong className="text-cocoa">pessoa</strong>,{" "}
              <strong className="text-cocoa">empresa</strong> ou{" "}
              <strong className="text-cocoa">veículo</strong>. Em segundos, com PDF baixável.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1 sm:pt-2 justify-center md:justify-start">
              <Button asChild variant="accent" size="xl">
                <Link href="/consultar">
                  Puxar minha primeira capivara
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="xl">
                <Link href="/precos">Ver planos e preços</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 pt-2 sm:pt-4 text-[11px] sm:text-xs font-mono text-tabaco/80">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-ok" /> LGPD compliant
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="size-4 text-saffron" /> Resultado em segundos
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="size-4 text-info" /> PDF assinado
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =========================================================================
// 3 Categorias
// =========================================================================

const CATEGORIAS = [
  {
    icon: UserRound,
    title: "CPF",
    subtitle: "Pessoa física",
    description:
      "Saiba quem é a pessoa antes de fechar negócio: identidade, contato, situação financeira e vínculos.",
    bullets: [
      "Dados cadastrais e situação na Receita",
      "Endereços, telefones e e-mails",
      "Score, dívidas, protestos e cheques",
      "Parentes, imóveis, veículos e empresas",
    ],
    color: "bg-info/15 text-info",
    href: "/consultar/cpf",
    starts: "9,90",
  },
  {
    icon: Building2,
    title: "CNPJ",
    subtitle: "Empresa",
    description:
      "Confirme se a empresa está ativa, com quem você está fechando contrato e qual a saúde financeira.",
    bullets: [
      "Razão social, situação e CNAE",
      "Quadro de sócios completo",
      "Certidões trabalhistas e fiscais",
      "Score empresarial e protestos",
    ],
    color: "bg-sage/20 text-sage",
    href: "/consultar/cnpj",
    starts: "7,90",
  },
  {
    icon: CarFront,
    title: "Veicular",
    subtitle: "Placa do veículo",
    description:
      "Antes de comprar ou vender um carro, descubra tudo sobre ele: dono, restrições, leilão e procedência.",
    bullets: [
      "Marca, modelo, ano, chassi e Fipe",
      "Proprietário atual e histórico",
      "Gravame, financiamento e leilão",
      "Recall, RENAJUD e roubo/furto",
    ],
    color: "bg-saffron/25 text-fur",
    href: "/consultar/veicular",
    starts: "9,90",
  },
];

function Categorias() {
  return (
    <section className="bg-paper-2 py-20 border-y border-line">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
            Qual capivara você quer puxar?
          </h2>
          <p className="mt-3 text-tabaco">
            Escolha uma das três categorias e descubra todo o histórico em segundos.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {CATEGORIAS.map(({ icon: Icon, title, subtitle, description, bullets, color, href, starts }) => (
            <Link
              key={title}
              href={href}
              className="group relative flex flex-col rounded-lg border border-line bg-card p-7 transition-all duration-200 ease-[var(--ease-cap)] hover:shadow-[var(--shadow-pop)] hover:-translate-y-1 hover:border-fur/60"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`size-14 rounded-md flex items-center justify-center ${color}`}>
                  <Icon className="size-7" strokeWidth={2} />
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-tabaco/70 uppercase tracking-wider">
                    A partir de
                  </div>
                  <div className="text-cocoa font-bold font-mono">R$ {starts}</div>
                </div>
              </div>

              <div className="mb-3">
                <h3 className="font-display text-2xl font-bold text-cocoa leading-tight">
                  {title}
                </h3>
                <p className="text-xs font-mono text-tabaco/70 mt-0.5 uppercase tracking-wider">
                  {subtitle}
                </p>
              </div>

              <p className="text-sm text-tabaco leading-relaxed mb-5">
                {description}
              </p>

              <ul className="space-y-1.5 mb-6 flex-1">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs text-cocoa">
                    <span className="size-1.5 rounded-full bg-fur mt-1.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-4 border-t border-line/60 flex items-center gap-2 text-sm font-medium text-cocoa group-hover:text-fur transition-colors">
                Puxar agora
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// =========================================================================
// Como funciona — 3 passos
// =========================================================================

const PASSOS = [
  {
    n: "01",
    icon: Search,
    title: "Escolhe e digita",
    description:
      "Selecione o plano que faz sentido pra você e digite o CPF, CNPJ ou placa.",
  },
  {
    n: "02",
    icon: Zap,
    title: "Pague com PIX",
    description:
      "Pagamento em segundos. Aceita PIX, boleto ou cartão à vista. Sem mensalidade.",
  },
  {
    n: "03",
    icon: FileText,
    title: "Receba o relatório",
    description:
      "PDF completo direto na tela, com possibilidade de download e compartilhamento.",
  },
];

function ComoFunciona() {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="outline" className="mb-3 font-mono">
            Como funciona
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
            Três passos, sem atrito.
          </h2>
          <p className="mt-3 text-tabaco">
            Do clique até o PDF na sua mão, em menos de um minuto.
          </p>
        </div>

        {/* Passos com linha conectora elegante */}
        <div className="relative grid gap-10 md:grid-cols-3 md:gap-6">
          {/* Linha tracejada conectando os 3 passos (desktop only) */}
          <div
            className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-px"
            aria-hidden
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, #E6D8BD 0 8px, transparent 8px 16px)",
            }}
          />

          {PASSOS.map(({ n, icon: Icon, title, description }) => (
            <div
              key={n}
              className="relative flex flex-col items-center text-center"
            >
              {/* Bolha do icone */}
              <div className="relative z-10 size-20 rounded-full bg-cocoa text-cream flex items-center justify-center shadow-[var(--shadow-card)]">
                <Icon className="size-8" strokeWidth={1.75} />
              </div>

              {/* Numero pequeno em badge */}
              <span className="absolute -top-2 -right-2 sm:right-auto sm:left-1/2 sm:translate-x-8 size-7 rounded-full bg-saffron text-cocoa font-display font-bold text-xs flex items-center justify-center shadow-sm">
                {n}
              </span>

              <h3 className="mt-5 font-display text-xl font-bold text-cocoa">
                {title}
              </h3>
              <p className="mt-2 text-sm text-tabaco leading-relaxed max-w-xs">
                {description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA + link saiba mais */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="primary" size="lg">
            <Link href="/consultar">
              Quero puxar agora
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Link
            href="/como-funciona"
            className="text-sm font-mono text-fur hover:underline underline-offset-4"
          >
            Ver detalhes técnicos →
          </Link>
        </div>
      </div>
    </section>
  );
}

// =========================================================================
// Casos de uso
// =========================================================================

const CASOS = [
  {
    titulo: "Vai alugar um imóvel?",
    descricao: "Confira o histórico do inquilino antes de assinar o contrato.",
    icon: "🏠",
  },
  {
    titulo: "Comprando carro usado?",
    descricao: "Veja gravame, multa, leilão e a procedência completa do veículo.",
    icon: "🚗",
  },
  {
    titulo: "Fechando com novo cliente?",
    descricao: "Confirme se a empresa está ativa e sem dívidas antes do contrato.",
    icon: "🤝",
  },
  {
    titulo: "Verificando candidato?",
    descricao: "Análise rápida do CPF do candidato pra contratação consciente.",
    icon: "📋",
  },
  {
    titulo: "Concedendo crédito?",
    descricao: "Score, restrições e dívidas atualizadas pra decidir com segurança.",
    icon: "💳",
  },
  {
    titulo: "Conhecendo gente nova?",
    descricao: "Antes de fechar negócio com qualquer estranho na internet.",
    icon: "👋",
  },
];

function CasosDeUso() {
  return (
    <section className="bg-paper-2 py-20 border-y border-line">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 font-mono">
            Quando usar
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
            Antes de fechar negócio com qualquer estranho,
            <span className="text-fur"> puxe a capivara.</span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CASOS.map(({ titulo, descricao, icon }) => (
            <div
              key={titulo}
              className="rounded-lg border border-line bg-card p-5 hover:border-fur/40 transition-colors"
            >
              <div className="text-3xl mb-3" aria-hidden>{icon}</div>
              <h3 className="font-display text-lg font-semibold text-cocoa mb-1">
                {titulo}
              </h3>
              <p className="text-sm text-tabaco leading-relaxed">{descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =========================================================================
// Planos em destaque
// =========================================================================

function PlanosDestaque() {
  // Destaca a Avancada de CPF + Avancado de Veicular (mais populares)
  const cpfAvancada = PLANOS_CPF.find((p) => p.destaque === "popular")!;
  const veicularAvancado = PLANOS_VEICULAR.find((p) => p.destaque === "popular")!;
  const cpfRaioX = PLANOS_CPF.find((p) => p.destaque === "premium")!;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 font-mono">
            Mais escolhidos
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
            Comece pelos planos mais populares.
          </h2>
          <p className="mt-3 text-tabaco">
            Ou veja o{" "}
            <Link href="/precos" className="text-fur underline-offset-4 hover:underline">
              catálogo completo
            </Link>
            {" "}com todas as opções e detalhes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <PlanCard
            plano={cpfAvancada}
            inclui={[
              "CPF Ultra Completo (400+ bases)",
              "Score Boa Vista",
              "Pendências financeiras",
              "Protestos e histórico",
              "Imóveis e veículos vinculados",
            ]}
          />
          <PlanCard
            plano={veicularAvancado}
            inclui={[
              "Placa, marca, modelo, ano",
              "BIN Nacional + Estadual",
              "Proprietário atual",
              "Gravame e financiamento",
              "Histórico de roubo/furto",
            ]}
          />
          <PlanCard
            plano={cpfRaioX}
            inclui={[
              "Tudo da Avançada +",
              "Serasa Premium",
              "SPC Brasil",
              "SCR BACEN",
              "Certidão Trabalhista",
              "Busca por documentos",
            ]}
          />
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="ghost" size="lg">
            <Link href="/precos">
              Ver todos os planos
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// =========================================================================
// FAQ
// =========================================================================

const FAQ_ITEMS = [
  {
    q: "Preciso assinar algum plano?",
    a: "Não. Você paga apenas pela consulta que fizer. Sem mensalidade, sem renovação automática. Você só volta se quiser.",
  },
  {
    q: "Quanto tempo demora?",
    a: "A maioria das consultas fica pronta em até 30 segundos. As mais completas (com várias bases) podem levar até 2 minutos.",
  },
  {
    q: "Posso baixar o relatório em PDF?",
    a: "Sim. Todo plano gera um PDF completo, com QR Code de verificação de autenticidade. Disponível por 90 dias na sua conta.",
  },
  {
    q: "É legal consultar dados de outras pessoas?",
    a: "Sim, dentro das finalidades previstas na LGPD (análise de crédito, contratação, locação, etc). Toda consulta exige declaração de finalidade.",
  },
  {
    q: "Aceita quais formas de pagamento?",
    a: "PIX (recomendado, instantâneo), boleto bancário e cartão de crédito à vista. Sem parcelamento por enquanto.",
  },
  {
    q: "Os dados são atualizados?",
    a: "Sim. Consultamos bases oficiais (Serasa, SPC, Boa Vista, SCR BACEN, RENAJUD, etc) em tempo real a cada solicitação. Cache de 24h se você repetir a mesma consulta, sem cobrar de novo.",
  },
];

function FAQ() {
  return (
    <section className="bg-paper-2 py-20 border-y border-line">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3 font-mono">
            Perguntas frequentes
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
            Toda dúvida tem uma resposta direta.
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-lg border border-line bg-card open:shadow-[var(--shadow-card)] transition-all"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between p-5 hover:bg-cream/30 rounded-lg transition-colors">
                <h3 className="font-display text-base font-semibold text-cocoa">
                  {q}
                </h3>
                <span className="size-6 rounded-full bg-cream text-cocoa flex items-center justify-center font-mono text-xs shrink-0 ml-3 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="px-5 pb-5 text-sm text-tabaco leading-relaxed">
                {a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// =========================================================================
// CTA Final
// =========================================================================

function CTAFinal() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="relative rounded-2xl bg-cocoa text-cream p-10 md:p-14 overflow-hidden">
          {/* Glow saffron */}
          <div className="absolute -top-20 -right-20 size-60 bg-saffron/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-60 bg-fur/30 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <Mascot pose="heroico" size={140} animate="idle" />

            <div className="text-center md:text-left flex-1">
              <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                Sua próxima decisão começa com{" "}
                <span className="text-saffron">uma capivara puxada.</span>
              </h2>
              <p className="mt-3 text-cream/80 leading-relaxed">
                Comece pela Espiadinha (R$ 9,90) e veja como é simples.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center md:justify-start">
                <Button asChild variant="accent" size="xl">
                  <Link href="/consultar">
                    Começar agora
                    <Sparkles className="size-5" />
                  </Link>
                </Button>
                <Link
                  href="/empresas"
                  className="text-sm font-mono text-cream/70 hover:text-saffron transition-colors underline-offset-4 hover:underline"
                >
                  Sou empresa, ver planos Manada →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* LGPD reassurance */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-mono text-tabaco/70">
          <Lock className="size-3.5" />
          Dados protegidos · LGPD · Toda consulta exige finalidade declarada
        </div>
      </div>
    </section>
  );
}
