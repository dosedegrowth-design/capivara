import type { Metadata } from "next";
import {
  Home,
  Briefcase,
  HandCoins,
  Handshake,
} from "lucide-react";

import { CategoriaLanding } from "@/components/marketing/categoria-landing";
import { PLANOS_CPF } from "@/lib/consultas/planos";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

export const metadata: Metadata = {
  title: "Consulta de CPF online · Score, dívidas e antecedentes · Capivara",
  description:
    "Puxe a capivara de qualquer CPF em segundos. Score, dívidas, protestos, vínculos, endereços e PDF assinado. Sem mensalidade, a partir de R$ 9,90. LGPD compliant.",
  keywords: [
    "consulta cpf",
    "consultar cpf online",
    "puxar cpf",
    "score cpf",
    "dívidas cpf",
    "protestos cpf",
    "background check pessoa física",
    "capivara cpf",
  ],
  alternates: { canonical: `${SITE}/consultar/cpf` },
  openGraph: {
    title: "Consulta de CPF online · Capivara",
    description:
      "Score, dívidas, protestos e vínculos de qualquer CPF em segundos. PDF baixável.",
    url: `${SITE}/consultar/cpf`,
    type: "website",
    images: [{ url: `${SITE}/og.png`, width: 1200, height: 630 }],
  },
};

export default function CPFLandingPage() {
  return (
    <>
      <CategoriaLanding
        content={{
          categoria: "cpf",
          h1: "Puxe a capivara do CPF antes de fechar negócio.",
          subheadline:
            "Score, dívidas, protestos, vínculos, telefones e endereços. Tudo em um PDF assinado, pronto em segundos. Sem mensalidade — você só paga as consultas que fizer.",
          badgeText: "Consulta CPF · pessoa física",
          useCases: [
            {
              icon: Home,
              title: "Aluguel & imobiliária",
              description:
                "Antes de fechar com o inquilino: situação financeira, ações trabalhistas, vínculos de endereço.",
            },
            {
              icon: HandCoins,
              title: "Venda a prazo",
              description:
                "Crediário, parcelamento e prestador de serviço: score, restrições, histórico de dívidas.",
            },
            {
              icon: Briefcase,
              title: "Contratação & RH",
              description:
                "Background check pré-admissão: antecedentes, vínculos profissionais e formação.",
            },
            {
              icon: Handshake,
              title: "Sócios & parceiros",
              description:
                "Confirme com quem você vai abrir empresa: trajetória, empresas anteriores, situação fiscal.",
            },
          ],
          niveis: [
            {
              nome: "Espiadinha",
              bullets: [
                "Nome completo, situação na Receita",
                "Filiação (nome da mãe)",
                "Data de nascimento, idade",
                "Validação de CPF na Receita Federal",
              ],
            },
            {
              nome: "Investigação",
              bullets: [
                "Tudo da Espiadinha",
                "Endereços históricos",
                "Telefones e e-mails",
                "Renda presumida",
                "Score de crédito básico",
                "Parentes próximos (1º grau)",
              ],
            },
            {
              nome: "Avançada",
              bullets: [
                "Tudo da Investigação",
                "Score Serasa + Boa Vista",
                "Dívidas em aberto",
                "Protestos cartorários",
                "Cheques sem fundo",
                "Vínculos empresariais",
              ],
            },
            {
              nome: "Premium",
              bullets: [
                "Tudo da Avançada",
                "Serasa Premium + Quod",
                "Cenprot completo (cartórios)",
                "Restrições trabalhistas",
                "Ações judiciais cíveis",
                "Imóveis e veículos no nome",
              ],
            },
            {
              nome: "Raio-X completo",
              bullets: [
                "Tudo da Premium",
                "SPC + SCR Bacen (sistema bancário)",
                "Busca por documentos vinculados",
                "Histórico completo de relacionamentos",
                "Score de fraude (compliance)",
                "Análise comportamental",
              ],
            },
          ],
          faq: [
            {
              q: "Preciso da autorização da pessoa pra consultar o CPF dela?",
              a: "Você declara a finalidade legítima no momento da consulta (LGPD Art. 7º). Para uso comercial — análise de crédito, locação, contratação — a base legal é o legítimo interesse. Pra qualquer outro uso, vale confirmar a base legal com seu jurídico.",
            },
            {
              q: "Quanto tempo demora?",
              a: "Em segundos. O processamento começa assim que o PIX é confirmado (instantâneo) ou o boleto compensa (1-2 dias úteis). O resultado vai pro seu email + dashboard.",
            },
            {
              q: "O PDF é aceito juridicamente?",
              a: "Sim. Cada relatório tem ID único + QR Code de verificação, e você pode validar a autenticidade na nossa página /verificar. Para uso em processos formais, considere também consulta presencial em cartório como complemento.",
            },
            {
              q: "Posso consultar o mesmo CPF várias vezes?",
              a: "Sim. Se você consultar o mesmo CPF + mesmo plano em até 24h, o resultado vem do cache automaticamente — não cobramos de novo. Isso protege você contra cobrança duplicada.",
            },
            {
              q: "Os dados ficam armazenados quanto tempo?",
              a: "90 dias acessíveis no seu dashboard. Após esse prazo, anonimizamos automaticamente (LGPD Art. 16). Você pode solicitar exclusão a qualquer momento.",
            },
            {
              q: "Tem como integrar com meu sistema?",
              a: "Sim. Temos API B2B com auth via Bearer token, idempotência via external_reference e webhooks com assinatura HMAC. Veja em /api-publica.",
            },
          ],
          planos: PLANOS_CPF,
          planoMaisBarato: PLANOS_CPF[0],
        }}
      />

      {/* Schema.org JSON-LD pra SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Consulta de CPF online",
            description:
              "Consulta de CPF com score, dívidas, protestos e vínculos. PDF assinado em segundos.",
            brand: { "@type": "Brand", name: "Capivara" },
            offers: PLANOS_CPF.map((p) => ({
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
