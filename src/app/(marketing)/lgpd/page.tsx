import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Mail, Download, Pencil, UserMinus, FileDown, BookOpen, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacidade · LGPD · Capivara",
  description:
    "Como a Capivara trata seus dados pessoais e os dados que você consulta. Direitos do titular, finalidades obrigatórias, retenção e contato do DPO.",
};

export default function LGPDPage() {
  return (
    <div className="bg-paper">
      <Header />
      <Compromissos />
      <Finalidades />
      <Direitos />
      <Retencao />
      <DPO />
    </div>
  );
}

function Header() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <div className="inline-flex size-16 rounded-full bg-ok/15 text-ok items-center justify-center mb-4">
          <ShieldCheck className="size-8" />
        </div>
        <Badge variant="outline" className="mb-3 font-mono">
          LGPD · Lei 13.709/2018
        </Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-cocoa">
          Privacidade não é asterisco.
        </h1>
        <p className="mt-4 text-tabaco text-lg leading-relaxed">
          Como tratamos seus dados pessoais — e os dados que você puxa de
          outras pessoas, empresas e veículos.
        </p>
        <p className="mt-2 font-mono text-xs text-tabaco/60">
          Última atualização: 21 de maio de 2026
        </p>
      </div>
    </section>
  );
}

const COMPROMISSOS = [
  {
    icon: Lock,
    title: "Você controla quando consulta",
    description:
      "Toda consulta exige declaração de finalidade. Sem finalidade válida, não permitimos a operação. O sistema bloqueia padrões abusivos (scraping, sequencial, alta velocidade).",
  },
  {
    icon: ShieldCheck,
    title: "Dados consultados expiram em 90 dias",
    description:
      "PDFs e resultados ficam disponíveis na sua conta por 90 dias. Após esse prazo, anonimizamos automaticamente. Você pode baixar e guardar localmente antes disso.",
  },
  {
    icon: BookOpen,
    title: "Tudo registrado em audit log",
    description:
      "Quem consultou o quê, quando, com qual finalidade e de qual IP. Registros imutáveis acessíveis sob solicitação ou ordem judicial.",
  },
];

function Compromissos() {
  return (
    <section className="py-12 bg-paper-2 border-y border-line">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-cocoa mb-8 text-center">
          Compromissos práticos
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {COMPROMISSOS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-lg border border-line bg-card p-6"
            >
              <div className="size-12 rounded-md bg-cream flex items-center justify-center text-fur mb-4">
                <Icon className="size-6" strokeWidth={2} />
              </div>
              <h3 className="font-display text-base font-semibold text-cocoa mb-2">
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

const FINALIDADES = {
  CPF: [
    "Análise de crédito",
    "Verificação para locação imobiliária",
    "Verificação para contratação (RH)",
    "Estabelecimento de relação comercial",
    "Verificação de identidade",
    "Consultar a si mesmo (autoconsulta)",
    "Outros (texto livre obrigatório)",
  ],
  CNPJ: [
    "Análise de crédito empresarial",
    "Due diligence (M&A, parceria)",
    "Verificação de fornecedor",
    "Verificação de sócio",
    "Autoconsulta da própria empresa",
    "Outros (texto livre obrigatório)",
  ],
  Veicular: [
    "Antes de comprar o veículo",
    "Antes de vender o veículo",
    "Análise para seguro",
    "Análise para financiamento",
    "Meu próprio veículo",
    "Outros (texto livre obrigatório)",
  ],
};

function Finalidades() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-cocoa text-center">
          Finalidades válidas por categoria
        </h2>
        <p className="mt-3 text-tabaco text-center max-w-2xl mx-auto">
          A LGPD exige base legal para tratar dados pessoais. Toda consulta
          Capivara escolhe uma dessas finalidades antes de processar.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {Object.entries(FINALIDADES).map(([categoria, lista]) => (
            <div
              key={categoria}
              className="rounded-lg border border-line bg-card p-6"
            >
              <h3 className="font-display text-lg font-bold text-cocoa mb-4">
                {categoria}
              </h3>
              <ul className="space-y-2">
                {lista.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-tabaco"
                  >
                    <span className="size-1.5 rounded-full bg-fur mt-2 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const DIREITOS = [
  {
    icon: Download,
    title: "Acesso aos seus dados",
    description:
      "Solicite uma cópia em JSON de tudo que armazenamos sobre você. Enviamos no seu e-mail em até 15 dias úteis.",
    action: "Solicitar exportação",
    href: "/dashboard/configuracoes",
  },
  {
    icon: Pencil,
    title: "Correção de dados",
    description:
      "Atualize seu nome, CPF, telefone, e-mail e demais dados cadastrais a qualquer momento na área da conta.",
    action: "Acessar configurações",
    href: "/dashboard/configuracoes",
  },
  {
    icon: UserMinus,
    title: "Anonimização / Exclusão",
    description:
      "Pedido de exclusão anonimiza seu cadastro imediatamente. Dados fiscais (transações) ficam por 5 anos por obrigação legal.",
    action: "Excluir minha conta",
    href: "/dashboard/configuracoes",
  },
  {
    icon: FileDown,
    title: "Portabilidade",
    description:
      "Baixe um ZIP com seu cadastro + todos os PDFs de consultas que você fez. Pronto para migrar ou guardar.",
    action: "Exportar portátil",
    href: "/dashboard/configuracoes",
  },
];

function Direitos() {
  return (
    <section className="py-20 bg-paper-2 border-y border-line">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 font-mono">
            Seus direitos
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
            Quatro direitos implementados no produto.
          </h2>
          <p className="mt-3 text-tabaco">
            Tudo executável diretamente na sua conta, sem precisar mandar
            e-mail ou esperar atendimento.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {DIREITOS.map(({ icon: Icon, title, description, action, href }) => (
            <div
              key={title}
              className="rounded-lg border border-line bg-card p-6 flex flex-col"
            >
              <div className="size-12 rounded-md bg-cream flex items-center justify-center text-fur mb-4">
                <Icon className="size-6" strokeWidth={2} />
              </div>
              <h3 className="font-display text-lg font-bold text-cocoa mb-2">
                {title}
              </h3>
              <p className="text-sm text-tabaco leading-relaxed flex-1">
                {description}
              </p>
              <Link
                href={href}
                className="mt-4 text-sm font-mono text-fur hover:underline underline-offset-4 self-start"
              >
                {action} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Retencao() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-bold text-cocoa">
          Tempo de retenção dos dados
        </h2>
        <p className="mt-3 text-tabaco">
          Cada tipo de dado tem um prazo específico, alinhado com a finalidade
          do tratamento e obrigações legais.
        </p>

        <table className="mt-8 w-full text-sm border border-line rounded-lg overflow-hidden">
          <thead className="bg-cream/60">
            <tr>
              <th className="text-left p-3 font-display font-semibold text-cocoa">
                Tipo de dado
              </th>
              <th className="text-left p-3 font-display font-semibold text-cocoa">
                Prazo
              </th>
              <th className="text-left p-3 font-display font-semibold text-cocoa">
                Motivo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <tr>
              <td className="p-3 text-cocoa">Resultados de consulta + PDFs</td>
              <td className="p-3 font-mono text-fur">90 dias</td>
              <td className="p-3 text-tabaco">Acesso ao usuário</td>
            </tr>
            <tr>
              <td className="p-3 text-cocoa">Dados cadastrais ativos</td>
              <td className="p-3 font-mono text-fur">Conta ativa</td>
              <td className="p-3 text-tabaco">Operação do serviço</td>
            </tr>
            <tr>
              <td className="p-3 text-cocoa">Transações e pagamentos</td>
              <td className="p-3 font-mono text-fur">5 anos</td>
              <td className="p-3 text-tabaco">Obrigação fiscal</td>
            </tr>
            <tr>
              <td className="p-3 text-cocoa">Logs de auditoria (audit_log)</td>
              <td className="p-3 font-mono text-fur">5 anos</td>
              <td className="p-3 text-tabaco">Segurança e LGPD</td>
            </tr>
            <tr>
              <td className="p-3 text-cocoa">Conta anonimizada</td>
              <td className="p-3 font-mono text-fur">Imediato</td>
              <td className="p-3 text-tabaco">Direito à anonimização</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DPO() {
  return (
    <section className="py-20 bg-paper-2 border-t border-line">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-line bg-card p-8 md:p-10">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="size-14 rounded-md bg-fur/10 text-fur flex items-center justify-center shrink-0">
              <Mail className="size-7" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold text-cocoa">
                Encarregado de Dados (DPO)
              </h2>
              <p className="mt-2 text-tabaco leading-relaxed">
                Para incidentes, denúncias, pedidos não atendidos pelo
                autoatendimento ou dúvidas sobre tratamento de dados:
              </p>

              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-tabaco/70">E-mail:</span>
                  <a
                    href="mailto:dpo@capivara.app"
                    className="font-mono text-fur hover:underline underline-offset-4"
                  >
                    dpo@capivara.app
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-tabaco/70">SLA:</span>
                  <span className="text-cocoa">15 dias úteis</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button asChild variant="primary" size="sm">
                  <a href="mailto:dpo@capivara.app?subject=Solicita%C3%A7%C3%A3o%20LGPD">
                    Enviar e-mail ao DPO
                  </a>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/contato">Canal de contato geral</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-tabaco/70 mt-8 text-center font-mono leading-relaxed">
          Capivara é mantida pela Dose de Growth Marketing LTDA — CNPJ XX.XXX.XXX/0001-XX
          <br />
          Em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018).
        </p>
      </div>
    </section>
  );
}
