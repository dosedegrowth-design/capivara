import type { Metadata } from "next";
import { CreditCard, ShieldAlert, TrendingDown } from "lucide-react";
import { CasoUsoLanding } from "@/components/marketing/caso-uso-landing";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

export const metadata: Metadata = {
  title: "Análise de crédito CPF e CNPJ pra venda a prazo · Capivara",
  description:
    "Antes de aprovar crediário, parcelamento ou venda a prazo: score, dívidas, protestos e SCR Bacen. PDF em segundos, a partir de R$ 9,90.",
  keywords: [
    "analise credito cpf",
    "score credito cliente",
    "consulta dividas",
    "prevencao inadimplencia",
    "credito venda a prazo",
  ],
  alternates: { canonical: `${SITE}/casos-de-uso/analise-credito` },
};

export default function CreditoPage() {
  return (
    <CasoUsoLanding
      content={{
        categoria: "cpf",
        audiencia: "comércio e crediário",
        badgeText: "Caso de uso · Análise de crédito",
        h1: "Puxe a capivara antes de aprovar venda a prazo.",
        subheadline:
          "Score Serasa + Boa Vista, dívidas em aberto, protestos cartorários e SCR Bacen. Análise de crédito em 30 segundos pra reduzir inadimplência.",
        beneficios: [
          {
            icon: TrendingDown,
            title: "Reduz inadimplência",
            description:
              "Score real (não score interno hipotético). Cliente classe E = limite menor ou recusa.",
          },
          {
            icon: ShieldAlert,
            title: "Alertas em tempo real",
            description:
              "Protestos novos, dívidas vencidas, SCR Bacen. Tudo que o bureau atualiza hoje.",
          },
          {
            icon: CreditCard,
            title: "Customize limite e parcelas",
            description:
              "Cliente com score alto = aprovação automática maior. Score baixo = pede entrada, parcelas menores.",
          },
        ],
        passos: [
          {
            title: "Cliente solicita crediário/parcelamento",
            description:
              "Ou abertura de conta na loja. Pede CPF + autorização LGPD.",
          },
          {
            title: "Consulte com finalidade 'Análise de crédito'",
            description:
              "Avançada (R$ 39,90) tem score + dívidas. Premium (R$ 89,90) inclui SCR Bacen e ações cíveis.",
          },
          {
            title: "Aprove com regras claras",
            description:
              "Score > 700: limite cheio. 500-700: limite reduzido. < 500: pede entrada ou recusa.",
          },
        ],
        oQueVem: [
          "Score Serasa + Boa Vista",
          "Renda presumida",
          "Dívidas em aberto",
          "Protestos cartorários",
          "Cheques sem fundo",
          "SCR Bacen (sistema bancário)",
          "Ações cíveis e trabalhistas",
          "Score de fraude (Raio-X)",
        ],
        planoRecomendado: {
          nome: "Avançada",
          preco: "R$ 39,90",
          id: "cpf-avancada",
        },
      }}
    />
  );
}
