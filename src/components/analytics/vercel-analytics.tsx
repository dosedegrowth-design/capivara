"use client";

import { Analytics } from "@vercel/analytics/next";

/**
 * Web Analytics da Vercel (sem cookie, sem dado pessoal — compativel com a
 * politica de cookies do site).
 *
 * So renderiza com NEXT_PUBLIC_VERCEL_ANALYTICS=1. Motivo: enquanto o Web
 * Analytics nao for ligado no painel da Vercel, o script responde 404 e suja
 * o console de todo visitante. Ligar no painel + setar a env = medindo.
 */
export function VercelAnalytics() {
  if (process.env.NEXT_PUBLIC_VERCEL_ANALYTICS !== "1") return null;
  return <Analytics />;
}
