import type { Metadata } from "next";
import { AlertTriangle, Car, ClipboardCheck } from "lucide-react";
import { CasoUsoLanding } from "@/components/marketing/caso-uso-landing";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://capivara-green.vercel.app";

export const metadata: Metadata = {
  title: "Consulta veicular pra revenda e multimarcas · Capivara",
  description:
    "Antes de aceitar a troca: histórico de leilão, sinistro, débitos, recall e bloqueio. PDF em segundos, a partir de R$ 14,90. Aceite com segurança.",
  keywords: [
    "consulta veicular revenda",
    "verificacao carro usado",
    "historico veicular concessionaria",
    "carro de leilao consulta",
    "carro sinistrado",
  ],
  alternates: { canonical: `${SITE}/casos-de-uso/revenda-automotiva` },
};

export default function RevendaPage() {
  return (
    <CasoUsoLanding
      content={{
        categoria: "veicular",
        audiencia: "revendas e multimarcas",
        badgeText: "Caso de uso · Revenda automotiva",
        h1: "Puxe a capivara do carro antes de aceitar a troca.",
        subheadline:
          "Carro de leilão, sinistrado, com débitos ou recall pendente vale 30-50% menos. Em segundos você sabe se vale a pena fazer a avaliação.",
        beneficios: [
          {
            icon: Car,
            title: "Histórico real",
            description:
              "Leilão, sinistro, transferências múltiplas. Tudo que afeta o valor de revenda do veículo.",
          },
          {
            icon: AlertTriangle,
            title: "Restrições ocultas",
            description:
              "Bloqueio judicial, alienação fiduciária, Renajud. O que pode travar a transferência depois.",
          },
          {
            icon: ClipboardCheck,
            title: "Decisão rápida",
            description:
              "Vendedor chega com o carro, você puxa a placa, decide em 30 segundos se aceita avaliar.",
          },
        ],
        passos: [
          {
            title: "Receba a placa do veículo",
            description:
              "Antes de iniciar a vistoria física, já puxa a capivara.",
          },
          {
            title: "Consulte (R$ 14,90 a R$ 199)",
            description:
              "Completa pra débitos + multas, Avançada pra leilão + sinistro, Total pra Renajud + KM histórico.",
          },
          {
            title: "Negocie com fundamento",
            description:
              "Carro limpo? Avalia normal. Carro com histórico? Ajusta proposta ou recusa com PDF na mão.",
          },
        ],
        oQueVem: [
          "Histórico de leilão",
          "Histórico de sinistro",
          "Débitos de IPVA e multas",
          "Bloqueio judicial / Renajud",
          "Alienação fiduciária (financiamento ativo)",
          "Recall pendente do fabricante",
          "Histórico de proprietários",
          "KM histórico (anti-fraude odômetro)",
        ],
        planoRecomendado: {
          nome: "Avançado",
          preco: "R$ 49,90",
          id: "veicular-avancado",
        },
      }}
    />
  );
}
