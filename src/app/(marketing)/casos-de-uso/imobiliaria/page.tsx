import type { Metadata } from "next";
import { Home, Shield, Zap } from "lucide-react";
import { CasoUsoLanding } from "@/components/marketing/caso-uso-landing";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

export const metadata: Metadata = {
  title: "Consulta de CPF pra imobiliária e aluguel · Capivara",
  description:
    "Antes de fechar o aluguel: score, dívidas, ações trabalhistas e histórico de endereços do inquilino. PDF em segundos, a partir de R$ 9,90.",
  keywords: [
    "consulta cpf imobiliaria",
    "background check inquilino",
    "analise locatario",
    "ficha cadastral aluguel",
    "score inquilino",
  ],
  alternates: { canonical: `${SITE}/casos-de-uso/imobiliaria` },
};

export default function ImobiliariaPage() {
  return (
    <CasoUsoLanding
      content={{
        categoria: "cpf",
        audiencia: "imobiliárias e locadores",
        badgeText: "Caso de uso · Aluguel",
        h1: "Puxe a capivara do inquilino antes de assinar contrato.",
        subheadline:
          "Em 30 segundos você vê score, dívidas em aberto, protestos, processos trabalhistas e endereços anteriores. Aluguel sem dor de cabeça começa antes da chave entregue.",
        beneficios: [
          {
            icon: Shield,
            title: "Reduz inadimplência",
            description:
              "Score real (Serasa/Boa Vista) + restrições ativas. Pega o sinal vermelho antes do contrato.",
          },
          {
            icon: Zap,
            title: "Aprova ou recusa em minutos",
            description:
              "PDF assinado pronto em segundos. Decisão rápida sem depender de análise externa.",
          },
          {
            icon: Home,
            title: "Histórico de endereços",
            description:
              "Quantas mudanças nos últimos anos. Padrão de comportamento que indica risco.",
          },
        ],
        passos: [
          {
            title: "Receba o CPF do candidato a inquilino",
            description:
              "Junto com a ficha cadastral comum (RG, comprovante de renda).",
          },
          {
            title: "Consulte pela Capivara (R$ 9,90 a R$ 199)",
            description:
              "Espiadinha pra confirmação básica, Avançada pra score + dívidas, Premium pra processos trabalhistas.",
          },
          {
            title: "Decida com PDF em mãos",
            description:
              "Tem todos os dados pra aprovar, pedir fiador adicional ou recusar com fundamento.",
          },
        ],
        oQueVem: [
          "Score Serasa + Boa Vista",
          "Dívidas em aberto e protestos",
          "Endereços históricos",
          "Telefones e e-mails de contato",
          "Ações judiciais cíveis",
          "Processos trabalhistas (Premium)",
          "Vínculos empresariais",
          "Parentes próximos",
        ],
        planoRecomendado: {
          nome: "Investigação",
          preco: "R$ 19,90",
          id: "cpf-investigacao",
        },
      }}
    />
  );
}
