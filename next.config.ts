import type { NextConfig } from "next";

/**
 * Cabecalhos de seguranca em todas as respostas.
 *
 * A CSP aqui e' deliberadamente estreita: so fecha o que nao tem efeito
 * colateral (ser embutido em iframe de terceiro, <object>, troca de <base>).
 * Nao restringe script-src porque o Next injeta script inline na hidratacao —
 * uma CSP de script sem nonce derruba o site inteiro.
 */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self' https://*.asaas.com",
  },
];

const nextConfig: NextConfig = {
  // Produtos retirados do catalogo: a URL ja foi indexada, entao leva pra
  // categoria em vez de deixar 404.
  async redirects() {
    return [
      // ATPV-e saiu da conta APIFULL (12/11/2026)
      {
        source: "/consultar/avulso/veicular-avulso-atpve",
        destination: "/consultar/veicular",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
