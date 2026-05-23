import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/legal/cookie-banner";

// Tipografia oficial Capivara · Cerrado v1.0
const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br"
  ),
  title: {
    default: "Capivara · Puxe a capivara antes de fechar negócio",
    template: "%s · Capivara",
  },
  description:
    "Consulta rápida e completa de histórico de CPF, CNPJ ou placa de veículo. Score, dívidas, gravame, certidões e mais. Sem mensalidade.",
  applicationName: "Capivara",
  authors: [{ name: "Dose de Growth", url: "https://dosedegrowth.com.br" }],
  generator: "Next.js",
  keywords: [
    "consultar cpf",
    "consultar cnpj",
    "consulta veicular",
    "puxar capivara",
    "score de credito",
    "verificar carro",
    "gravame veiculo",
    "leilao carro",
    "renajud",
    "dividas cpf",
    "antes de comprar carro",
    "antes de alugar imovel",
  ],
  referrer: "origin-when-cross-origin",
  category: "Tecnologia",
  openGraph: {
    title: "Capivara · Puxe a capivara antes de fechar negócio",
    description:
      "Consulta rápida e completa de pessoas, empresas e veículos. Sem mensalidade, PDF baixável, 100% LGPD.",
    url: "/",
    siteName: "Capivara",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Capivara · Puxe a capivara antes de fechar negócio",
    description:
      "Consulta de CPF, CNPJ e veicular em segundos. PDF baixável, sem mensalidade.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF6EC" },
    { media: "(prefers-color-scheme: dark)", color: "#1F1611" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD Organization + WebSite — ajuda Google a entender a marca
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Capivara",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br",
    logo: "/icon.svg",
    description:
      "Consulta de histórico de pessoas, empresas e veículos. CPF, CNPJ e Veicular.",
    sameAs: ["https://dosedegrowth.com.br"],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Capivara",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br",
    inLanguage: "pt-BR",
  };

  return (
    <html
      lang="pt-BR"
      className={`${bricolage.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
