import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/empresa/",
          "/admin/",
          "/cliente/",
          "/verificar/",
          "/consultar/aguardando/",
          "/historico/",
          "/onboarding",
          "/login",
          "/cadastro",
          "/recuperar-senha",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
