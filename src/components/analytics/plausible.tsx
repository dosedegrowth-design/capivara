"use client";

import Script from "next/script";

/**
 * Plausible Analytics — LGPD-clean (sem cookies, sem PII).
 *
 * Ativado apenas quando `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` esta setado
 * (em prod). Sem a env, o componente nao renderiza nada (return null),
 * entao funciona em local/dev sem precisar mockar nada.
 *
 * Eventos custom: usar `track()` em src/lib/analytics.ts.
 */
export function Plausible() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  return (
    <Script
      strategy="afterInteractive"
      data-domain={domain}
      src="https://plausible.io/js/script.tagged-events.js"
    />
  );
}
