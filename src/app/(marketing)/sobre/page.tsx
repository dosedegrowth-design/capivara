import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Lightbulb,
  Lock,
  Shield,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/capivara/mascot";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

export const metadata: Metadata = {
  title: "Sobre a Capivara · Quem somos e por que existimos",
  description:
    "A Capivara nasceu pra deixar consulta de pessoas, empresas e veículos rápida, transparente e justa. Sem mensalidade, sem letra miúda, 100% LGPD.",
  alternates: { canonical: `${SITE}/sobre` },
};

export default function SobrePage() {
  return (
    <div className="bg-paper">
      {/* HERO */}
      <section className="bg-paper-2 border-b border-line py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge variant="outline" className="mb-3 font-mono">
                Sobre a Capivara
              </Badge>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-cocoa tracking-tight">
                Verificar não precisa ser{" "}
                <span className="text-fur">complicado</span>.
              </h1>
              <p className="mt-4 text-lg text-tabaco leading-relaxed">
                Existem 200 milhões de pessoas no Brasil e milhões de empresas e
                veículos. Antes de fechar negócio com qualquer um deles, vale
                puxar a capivara.
              </p>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 -z-10 bg-saffron/20 blur-3xl rounded-full" />
                <Mascot pose="investigando" size={260} animate="idle" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSAO */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-2xl border-2 border-fur/30 bg-fur/5 p-8 md:p-10">
            <Target className="size-8 text-fur mb-3" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-cocoa">
              Nossa missão
            </h2>
            <p className="mt-3 text-tabaco text-lg leading-relaxed">
              Deixar a verificação de pessoas, empresas e veículos{" "}
              <strong className="text-cocoa">
                rápida, transparente e justa
              </strong>{" "}
              pra qualquer brasileiro — não só pra quem trabalha em banco grande.
            </p>
          </div>
        </div>
      </section>

      {/* HISTORIA */}
      <section className="py-12 md:py-16 bg-paper-2 border-y border-line">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-3 font-mono">
              Por que existimos
            </Badge>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cocoa">
              O problema que vimos
            </h2>
          </div>

          <div className="space-y-6 text-tabaco leading-relaxed">
            <p>
              Por décadas, consultar CPF, CNPJ ou placa no Brasil envolveu três
              caminhos ruins:
            </p>
            <ol className="space-y-3 ml-4">
              <li className="flex gap-3">
                <span className="font-display font-bold text-fur shrink-0">1.</span>
                <div>
                  <strong className="text-cocoa">Mensalidade pesada</strong> —
                  bureaus tradicionais cobram R$ 200+/mês mesmo se você fizer 2
                  consultas. Pequena empresa não paga.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-display font-bold text-fur shrink-0">2.</span>
                <div>
                  <strong className="text-cocoa">UX dos anos 90</strong> — sites
                  feios, login obrigatório com cadastro de 20 campos, PDF sem
                  formatação.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-display font-bold text-fur shrink-0">3.</span>
                <div>
                  <strong className="text-cocoa">Gambiarra LGPD</strong> — texto
                  legal escondido, sem finalidade declarada, sem auditoria.
                </div>
              </li>
            </ol>

            <p className="pt-3">
              A Capivara existe pra resolver os três ao mesmo tempo:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-fur mt-1">→</span>
                <span>
                  <strong className="text-cocoa">Sem mensalidade.</strong> Você
                  paga por consulta. Avulso ou pacote prepago.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-fur mt-1">→</span>
                <span>
                  <strong className="text-cocoa">UX moderna.</strong> Cadastro
                  em 30s, PDF assinado, app mobile-first.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-fur mt-1">→</span>
                <span>
                  <strong className="text-cocoa">LGPD operacional.</strong>{" "}
                  Finalidade declarada em cada consulta, log com IP + hash, DPO
                  acessível.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-3 font-mono">
              Nossos valores
            </Badge>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cocoa">
              No que acreditamos
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ValorCard
              icon={Lock}
              title="Privacidade é direito"
              text="Dados pessoais não são commodity. Quem consulta declara finalidade. Quem é consultado tem direitos."
            />
            <ValorCard
              icon={Lightbulb}
              title="Transparência radical"
              text="Tabela de preços pública, hash dos termos visível, código aberto pra revisão técnica."
            />
            <ValorCard
              icon={Heart}
              title="Pequeno também merece"
              text="Imobiliária com 1 unidade, freelancer, mecânico, lojista — sem fidelidade, paga só o que usa."
            />
            <ValorCard
              icon={Shield}
              title="Intermediário, não fonte"
              text="A gente não cria os dados — só agrega. Quem usa entende que fonte oficial sempre prevalece."
            />
            <ValorCard
              icon={Sparkles}
              title="UX importa"
              text="Verificar antecedentes não precisa ser chato. PDF bonito, fluxo claro, app que funciona no mobile."
            />
            <ValorCard
              icon={Target}
              title="Sem letra miúda"
              text="O que tem aqui é o que tem. Sem ‘planos premium ocultos’ ou taxa surpresa no final."
            />
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA TECNICAMENTE */}
      <section className="py-12 md:py-16 bg-paper-2 border-y border-line">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Badge variant="outline" className="mb-3 font-mono">
            Por baixo do capô
          </Badge>
          <h2 className="font-display text-2xl md:text-4xl font-bold text-cocoa mb-6">
            Como agregamos os dados
          </h2>

          <div className="space-y-4 text-tabaco leading-relaxed">
            <p>
              A Capivara consulta dados em <strong className="text-cocoa">fontes oficiais e bureaus privados</strong>:
            </p>
            <ul className="space-y-2 ml-4">
              <li>• <strong className="text-cocoa">Receita Federal</strong> — situação cadastral CPF/CNPJ</li>
              <li>• <strong className="text-cocoa">Detran</strong> — dados veiculares, multas, débitos, Renajud</li>
              <li>• <strong className="text-cocoa">Serasa, Boa Vista, SPC</strong> — score, dívidas, protestos</li>
              <li>• <strong className="text-cocoa">SCR Bacen</strong> — sistema financeiro nacional</li>
              <li>• <strong className="text-cocoa">Cartórios</strong> — protestos, certidões</li>
              <li>• <strong className="text-cocoa">Tribunais (TST, TJs)</strong> — ações trabalhistas, processos cíveis</li>
            </ul>
            <p className="pt-3">
              Cada plano combina um conjunto de fontes e entrega num{" "}
              <strong className="text-cocoa">PDF assinado eletronicamente</strong> com QR Code
              de verificação em <Link href="/verificar/exemplo" className="text-fur hover:underline">/verificar/[id]</Link>.
            </p>
            <p>
              Cache de 24h por padrão (consulta repetida não cobra). Empresas
              têm cache estendido pra 7 dias.
            </p>
          </div>
        </div>
      </section>

      {/* QUEM ESTÁ POR TRÁS */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Badge variant="outline" className="mb-3 font-mono">
            Quem fez
          </Badge>
          <h2 className="font-display text-2xl md:text-4xl font-bold text-cocoa mb-6">
            Por trás da Capivara
          </h2>

          <div className="rounded-2xl border border-line bg-card p-6 md:p-8">
            <p className="text-tabaco leading-relaxed">
              A Capivara é mantida pela{" "}
              <a
                href="https://dosedegrowth.com.br"
                target="_blank"
                rel="noopener"
                className="text-fur font-semibold hover:underline"
              >
                Dose de Growth
              </a>
              , agência brasileira de automação e IA aplicada a operações.
            </p>
            <p className="mt-3 text-tabaco leading-relaxed">
              Construímos a Capivara depois de ver dezenas de clientes precisando
              de consultas (KYC, antifraude, due diligence) e batendo na mesma
              parede: mensalidade alta, UX feia, contrato obscuro. Resolvemos
              construir o que a gente mesmo queria usar.
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-12 md:py-20 bg-paper-2 border-t border-line">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="relative rounded-2xl bg-cocoa text-cream p-8 md:p-12 overflow-hidden text-center">
            <div className="absolute -top-20 -right-20 size-60 bg-saffron/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-60 bg-fur/30 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight">
                Pronta pra puxar a primeira capivara?
              </h2>
              <p className="mt-3 text-cream/80 max-w-lg mx-auto">
                Sem cadastro complicado. Espiadinha de CPF começa em R$ 9,90.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="accent" size="xl">
                  <Link href="/consultar">
                    Começar agora
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="xl">
                  <Link href="/contato">Falar com o time</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValorCard({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-card p-5">
      <div className="size-10 rounded-lg bg-fur/15 text-fur flex items-center justify-center mb-3">
        <Icon className="size-5" />
      </div>
      <h3 className="font-display font-semibold text-cocoa">{title}</h3>
      <p className="text-sm text-tabaco leading-relaxed mt-1">{text}</p>
    </div>
  );
}
