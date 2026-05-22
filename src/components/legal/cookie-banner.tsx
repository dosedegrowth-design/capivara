"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Banner de cookies persistente.
 *
 * Aparece na primeira visita. Apos clicar em "Aceitar e continuar",
 * grava flag em localStorage e nao mostra mais.
 *
 * A Capivara so usa cookies essenciais (sessao Supabase + CSRF +
 * preferencias locais). Esse banner existe pra demonstrar conformidade
 * LGPD/GDPR mesmo sem usar cookies de tracking.
 *
 * Se no futuro adicionarmos cookies nao-essenciais, expandimos
 * pra "Aceitar todos" / "Apenas essenciais" / "Personalizar".
 */

const LS_KEY = "capivara_cookie_accepted_v1";

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const accepted = localStorage.getItem(LS_KEY);
      if (!accepted) setShow(true);
    } catch {
      // SSR / cookies bloqueados
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(LS_KEY, new Date().toISOString());
    } catch {}
    setShow(false);
  }

  // Render condicional pra evitar flash no SSR
  if (!mounted || !show) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-in slide-in-from-bottom-4 fade-in duration-300"
    >
      <div className="rounded-xl border border-line bg-card shadow-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-lg bg-fur/15 text-fur flex items-center justify-center shrink-0">
            <Cookie className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="cookie-banner-title"
              className="font-display font-semibold text-cocoa text-sm"
            >
              Capivara usa só cookies essenciais
            </h3>
            <p className="text-xs text-tabaco mt-1 leading-relaxed">
              Pra manter você logada e o site funcionar. Sem tracking de
              terceiros, sem Google Analytics, sem perfil.{" "}
              <Link href="/cookies" className="text-fur hover:underline">
                Saber mais
              </Link>
              .
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={accept} size="sm" variant="accent">
                Entendi
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/privacidade" target="_blank">
                  Política de Privacidade
                </Link>
              </Button>
            </div>
          </div>
          <button
            onClick={accept}
            className="text-tabaco/60 hover:text-cocoa transition-colors shrink-0"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
