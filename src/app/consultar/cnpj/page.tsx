import type { Metadata } from "next";
import { Building, FileSignature, Truck, Banknote } from "lucide-react";

import { CategoriaLanding } from "@/components/marketing/categoria-landing";
import { PLANOS_CNPJ } from "@/lib/consultas/planos";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://capivara-green.vercel.app";

export const metadata: Metadata = {
  title: "Consulta de CNPJ online · Sócios, certidões e situação fiscal · Capivara",
  description:
    "Puxe a capivara de qualquer CNPJ em segundos. Quadro societário, situação fiscal, certidões trabalhistas, score empresarial. PDF assinado, a partir de R$ 7,90.",
  keywords: [
    "consulta cnpj",
    "consultar cnpj online",
    "quadro societário",
    "certidão fiscal",
    "score empresarial",
    "background check empresa",
    "due diligence cnpj",
    "capivara cnpj",
  ],
  alternates: { canonical: `${SITE}/consultar/cnpj` },
  openGraph: {
    title: "Consulta de CNPJ online · Capivara",
    description:
      "Quadro societário, situação fiscal e certidões de qualquer CNPJ. PDF assinado em segundos.",
    url: `${SITE}/consultar/cnpj`,
    type: "website",
    images: [{ url: `${SITE}/og.png`, width: 1200, height: 630 }],
  },
};

export default function CNPJLandingPage() {
  return (
    <>
      <CategoriaLanding
        content={{
          categoria: "cnpj",
          h1: "Puxe a capivara da empresa antes de assinar contrato.",
          subheadline:
            "Quadro de sócios, situação na Receita, certidões trabalhistas e fiscais, score empresarial. Tudo em PDF assinado, pronto em segundos. Sem mensalidade.",
          badgeText: "Consulta CNPJ · pessoa jurídica",
          mascotPose: "heroico",
          useCases: [
            {
              icon: FileSignature,
              title: "Contrato com fornecedor",
              description:
                "Antes de assinar: situação fiscal, certidões em dia, restrições trabalhistas e quadro de sócios.",
            },
            {
              icon: Banknote,
              title: "Vendas B2B & crédito",
              description:
                "Análise de risco pra venda a prazo: score empresarial, protestos e histórico financeiro.",
            },
            {
              icon: Truck,
              title: "Transporte & logística",
              description:
                "Frotista, transportadora ou operadora: regularidade da ANTT, certidões e quadro societário.",
            },
            {
              icon: Building,
              title: "M&A & due diligence",
              description:
                "Aquisição ou parceria estratégica: levantamento completo de sócios, ações e regularidade.",
            },
          ],
          niveis: [
            {
              nome: "Espiadinha",
              bullets: [
                "Razão social e nome fantasia",
                "Situação cadastral na Receita",
                "CNAE principal e secundárias",
                "Data de abertura",
                "Endereço da sede",
              ],
            },
            {
              nome: "Sócios",
              bullets: [
                "Tudo da Espiadinha",
                "Quadro societário completo",
                "CPF dos sócios e administradores",
                "Capital social",
                "Histórico de alterações societárias",
              ],
            },
            {
              nome: "Premium",
              bullets: [
                "Tudo do plano Sócios",
                "Certidão negativa trabalhista (TST)",
                "Certidão fiscal federal",
                "Certidão de protestos",
                "Score empresarial Serasa/Boa Vista",
                "Restrições e pendências",
              ],
            },
            {
              nome: "Total (Due Diligence)",
              bullets: [
                "Tudo do Premium",
                "Análise tributária (Simples/MEI/LP)",
                "Histórico de processos cíveis",
                "Histórico de processos trabalhistas",
                "Cred Plus empresarial",
                "Ações na junta comercial",
                "Empresas do mesmo grupo",
              ],
            },
          ],
          faq: [
            {
              q: "Por que consultar CNPJ antes de fechar contrato?",
              a: "Evita litígio futuro. Empresa irregular no fisco, sócio com restrição ou histórico de processos trabalhistas são sinais de risco. Custa menos puxar antes do que cobrar uma fatura impagável depois.",
            },
            {
              q: "A consulta de CNPJ é pública?",
              a: "Dados cadastrais básicos sim (Receita Federal). Mas quadro societário detalhado, certidões trabalhistas e score empresarial vêm de fontes pagas que consolidamos em um único relatório.",
            },
            {
              q: "Posso consultar para várias finalidades?",
              a: "Sim. Você declara a finalidade no momento da consulta — análise de crédito, contratação de fornecedor, due diligence, parceria comercial. Tudo logado pra LGPD.",
            },
            {
              q: "Tem cache se eu consultar a mesma empresa de novo?",
              a: "Sim. Mesmo CNPJ + mesmo plano em até 24h: cache automático, sem cobrar de novo. Pra time comercial isso evita custo duplicado.",
            },
            {
              q: "Posso usar via API no meu sistema (ERP, CRM, antifraude)?",
              a: "Sim. API REST com Bearer token, idempotência via external_reference e webhooks HMAC. Cobrança por consulta (você compra um pacote de créditos e cada chamada debita o valor). Veja em /api-publica.",
            },
            {
              q: "E se o CNPJ estiver baixado ou suspenso?",
              a: "O relatório retorna mesmo assim — situação cadastral é parte da informação. Útil pra confirmar que aquela empresa de papel timbrado realmente existe.",
            },
          ],
          planos: PLANOS_CNPJ,
          planoMaisBarato: PLANOS_CNPJ[0],
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Consulta de CNPJ online",
            description:
              "Quadro societário, situação fiscal e certidões de qualquer CNPJ. PDF assinado em segundos.",
            brand: { "@type": "Brand", name: "Capivara" },
            offers: PLANOS_CNPJ.map((p) => ({
              "@type": "Offer",
              name: p.nome,
              description: p.descricao,
              price: (p.precoB2C_centavos / 100).toFixed(2),
              priceCurrency: "BRL",
              availability: "https://schema.org/InStock",
            })),
          }),
        }}
      />
    </>
  );
}
