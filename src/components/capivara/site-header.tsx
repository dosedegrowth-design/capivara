"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/capivara/mascot";
import { cn } from "@/lib/utils";
import { MENU_PRINCIPAL, type EntradaMenu } from "@/lib/consultas/menu";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [aberto, setAberto] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const fecharTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clique fora e Esc fecham o dropdown.
  useEffect(() => {
    if (!aberto) return;
    function foraDoMenu(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setAberto(null);
      }
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(null);
    }
    document.addEventListener("mousedown", foraDoMenu);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", foraDoMenu);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  // Pequeno atraso ao sair: sem isso, atravessar o vao entre o rotulo e o
  // painel fecha o menu no meio do movimento do mouse.
  function agendarFechar() {
    if (fecharTimer.current) clearTimeout(fecharTimer.current);
    fecharTimer.current = setTimeout(() => setAberto(null), 180);
  }
  function cancelarFechar() {
    if (fecharTimer.current) clearTimeout(fecharTimer.current);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 group shrink-0"
          onClick={() => setOpen(false)}
        >
          <Mascot pose="padrao" size={36} animate={false} />
          <span className="font-display text-xl font-bold text-cocoa group-hover:text-fur transition-colors">
            capivara
          </span>
        </Link>

        {/* Nav desktop */}
        <nav
          ref={navRef}
          className="hidden lg:flex items-center gap-0.5 text-sm font-medium text-cocoa"
        >
          {MENU_PRINCIPAL.map((entrada) => (
            <EntradaDesktop
              key={entrada.label}
              entrada={entrada}
              aberto={aberto === entrada.label}
              onAbrir={() => {
                cancelarFechar();
                setAberto(entrada.label);
              }}
              onFechar={agendarFechar}
              onAlternar={() =>
                setAberto((a) => (a === entrada.label ? null : entrada.label))
              }
              onNavegar={() => setAberto(null)}
            />
          ))}
        </nav>

        {/* Ações desktop */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild variant="accent" size="sm">
            <Link href="/consultar">Puxar capivara</Link>
          </Button>
        </div>

        {/* Hamburguer mobile */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden size-10 rounded-md flex items-center justify-center text-cocoa hover:bg-cream transition-colors"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Drawer mobile */}
      <div
        className={cn(
          "lg:hidden absolute top-16 left-0 right-0 border-b border-line bg-paper shadow-[var(--shadow-card)] transition-all duration-300 ease-[var(--ease-cap)]",
          open
            ? "max-h-[calc(100dvh-4rem)] overflow-y-auto opacity-100"
            : "max-h-0 overflow-hidden opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex flex-col p-4 gap-1">
          {MENU_PRINCIPAL.map((entrada) => (
            <EntradaMobile
              key={entrada.label}
              entrada={entrada}
              onNavegar={() => setOpen(false)}
            />
          ))}

          <div className="mt-2 pt-3 border-t border-line/60 flex flex-col gap-2">
            <Button asChild variant="secondary" size="md" className="w-full">
              <Link href="/login" onClick={() => setOpen(false)}>
                Entrar
              </Link>
            </Button>
            <Button asChild variant="accent" size="md" className="w-full">
              <Link href="/consultar" onClick={() => setOpen(false)}>
                Puxar capivara
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

// -------------------------------------------------------------------------
// Desktop
// -------------------------------------------------------------------------

function EntradaDesktop({
  entrada,
  aberto,
  onAbrir,
  onFechar,
  onAlternar,
  onNavegar,
}: {
  entrada: EntradaMenu;
  aberto: boolean;
  onAbrir: () => void;
  onFechar: () => void;
  onAlternar: () => void;
  onNavegar: () => void;
}) {
  // Sem submenu: link simples.
  if (!entrada.secoes) {
    return (
      <Link
        href={entrada.href}
        className="px-3 py-2 rounded-md hover:text-fur transition-colors"
      >
        {entrada.label}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={onAbrir}
      onMouseLeave={onFechar}
    >
      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={aberto}
        aria-haspopup="true"
        className={cn(
          "inline-flex items-center gap-1 px-3 py-2 rounded-md transition-colors",
          aberto ? "text-fur bg-cream/60" : "hover:text-fur"
        )}
      >
        {entrada.label}
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200",
            aberto && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {/* O painel encosta no botao (top-full) pra nao ter vao morto no caminho
          do mouse — sem isso o menu pisca ao descer. */}
      <div
        className={cn(
          "absolute left-0 top-full pt-2 transition-all duration-150 ease-[var(--ease-cap)]",
          aberto
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-1 invisible pointer-events-none"
        )}
      >
        <div className="w-[480px] rounded-xl border border-line bg-card shadow-[var(--shadow-pop)] p-5 grid grid-cols-2 gap-x-6 gap-y-1">
          {entrada.secoes.map((secao) => (
            <div key={secao.titulo}>
              <p className="font-mono text-[10px] uppercase tracking-widest text-tabaco mb-2">
                {secao.titulo}
              </p>
              <ul className="space-y-1">
                {secao.itens.map((item) => (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      onClick={onNavegar}
                      className="block rounded-md px-2 py-2 -mx-2 hover:bg-cream transition-colors group/i"
                    >
                      <span className="block text-sm leading-tight text-cocoa group-hover/i:text-fur transition-colors">
                        {item.label}
                      </span>
                      {item.hint && (
                        <span className="mt-0.5 block text-xs text-tabaco leading-snug">
                          {item.hint}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Mobile — acordeao
// -------------------------------------------------------------------------

function EntradaMobile({
  entrada,
  onNavegar,
}: {
  entrada: EntradaMenu;
  onNavegar: () => void;
}) {
  const [expandido, setExpandido] = useState(false);

  if (!entrada.secoes) {
    return (
      <Link
        href={entrada.href}
        onClick={onNavegar}
        className="px-3 py-2.5 rounded-md text-sm font-medium text-cocoa hover:bg-cream transition-colors"
      >
        {entrada.label}
      </Link>
    );
  }

  return (
    <div>
      {/* O rotulo leva pra categoria; a seta abre a lista. Duas areas de toque
          separadas, senao nao da pra chegar na landing pelo celular. */}
      <div className="flex items-stretch">
        <Link
          href={entrada.href}
          onClick={onNavegar}
          className="flex-1 px-3 py-2.5 rounded-md text-sm font-medium text-cocoa hover:bg-cream transition-colors"
        >
          {entrada.label}
        </Link>
        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          aria-expanded={expandido}
          aria-label={`${expandido ? "Fechar" : "Abrir"} submenu de ${entrada.label}`}
          className="size-10 shrink-0 rounded-md flex items-center justify-center text-tabaco hover:bg-cream transition-colors"
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              expandido && "rotate-180"
            )}
          />
        </button>
      </div>

      {expandido && (
        <div className="pl-3 pb-2 space-y-3">
          {entrada.secoes.map((secao) => (
            <div key={secao.titulo}>
              <p className="font-mono text-[10px] uppercase tracking-widest text-tabaco px-3 py-1.5">
                {secao.titulo}
              </p>
              <ul>
                {secao.itens.map((item) => (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      onClick={onNavegar}
                      className="block px-3 py-2 rounded-md text-sm text-cocoa hover:bg-cream transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
