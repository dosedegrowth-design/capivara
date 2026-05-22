import type { Metadata } from "next";
import { Briefcase, FileSearch, Users } from "lucide-react";
import { CasoUsoLanding } from "@/components/marketing/caso-uso-landing";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://capivara-green.vercel.app";

export const metadata: Metadata = {
  title: "Background check pra RH e contratação · Capivara",
  description:
    "Antes da admissão: ações trabalhistas, vínculos profissionais, antecedentes financeiros. PDF em segundos pra decisão de contratação fundamentada.",
  keywords: [
    "background check rh",
    "consulta admissao",
    "due diligence funcionario",
    "ficha cadastral contratacao",
    "verificacao candidato",
  ],
  alternates: { canonical: `${SITE}/casos-de-uso/rh-contratacao` },
};

export default function RHPage() {
  return (
    <CasoUsoLanding
      content={{
        categoria: "cpf",
        audiencia: "RH e gestores",
        badgeText: "Caso de uso · Contratação",
        h1: "Puxe a capivara do candidato antes da admissão.",
        subheadline:
          "Ações trabalhistas em curso, vínculos empresariais anteriores, restrições financeiras. Background check rápido pra reduzir risco de contratação errada.",
        beneficios: [
          {
            icon: FileSearch,
            title: "Ações trabalhistas",
            description:
              "Histórico de processos contra ex-empregadores. Sinal de alerta pra cultura ou postura.",
          },
          {
            icon: Briefcase,
            title: "Vínculos empresariais",
            description:
              "Empresas onde já foi sócio ou administrador. Confere com o currículo apresentado.",
          },
          {
            icon: Users,
            title: "Antecedentes financeiros",
            description:
              "Score, protestos, restrições. Importante pra cargos de gestão de caixa ou suprimentos.",
          },
        ],
        passos: [
          {
            title: "Solicite o CPF na entrevista final",
            description:
              "Junto com autorização LGPD do candidato pra verificação.",
          },
          {
            title: "Consulte com finalidade 'Contratação / RH'",
            description:
              "Plano Premium recomendado pra incluir processos trabalhistas e ações cíveis.",
          },
          {
            title: "Anexe o PDF ao processo de admissão",
            description:
              "Documentação pra compliance interno e auditoria futura.",
          },
        ],
        oQueVem: [
          "Score Serasa + Boa Vista",
          "Ações judiciais cíveis",
          "Processos trabalhistas (Premium)",
          "Vínculos empresariais (sócio/admin)",
          "Restrições e protestos",
          "Endereços históricos",
          "Telefones e contatos",
          "Análise comportamental (Raio-X)",
        ],
        planoRecomendado: {
          nome: "Premium",
          preco: "R$ 89,90",
          id: "cpf-premium",
        },
      }}
    />
  );
}
