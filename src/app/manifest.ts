import type { MetadataRoute } from "next";

/**
 * Web App Manifest (PWA).
 *
 * Permite install no celular ("Adicionar à tela inicial").
 * Tema cocoa + saffron, ícone capivara, scope toda a app.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Capivara · Puxe a capivara antes de fechar negócio",
    short_name: "Capivara",
    description:
      "Consulta de CPF, CNPJ e veicular em segundos. Sem mensalidade, PDF baixável, LGPD-compliant.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF6EC",
    theme_color: "#1F1611",
    orientation: "portrait-primary",
    lang: "pt-BR",
    categories: ["business", "finance", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Consultar CPF",
        short_name: "CPF",
        description: "Consulta de pessoa física",
        url: "/consultar/cpf",
      },
      {
        name: "Consultar CNPJ",
        short_name: "CNPJ",
        description: "Consulta de empresa",
        url: "/consultar/cnpj",
      },
      {
        name: "Consultar Veicular",
        short_name: "Placa",
        description: "Consulta de veículo",
        url: "/consultar/veicular",
      },
    ],
  };
}
