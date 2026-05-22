"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/capivara/mascot";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/precos", label: "Preços" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/empresas", label: "Empresas" },
  { href: "/blog", label: "Blog" },
  { href: "/lgpd", label: "LGPD" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={() => setOpen(false)}
        >
          <Mascot pose="padrao" size={36} animate={false} />
          <span className="font-display text-xl font-bold text-cocoa group-hover:text-fur transition-colors">
            capivara
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-cocoa">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hover:text-fur transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Ações desktop */}
        <div className="hidden md:flex items-center gap-2">
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
          className="md:hidden size-10 rounded-md flex items-center justify-center text-cocoa hover:bg-cream transition-colors"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Drawer mobile */}
      <div
        className={cn(
          "md:hidden absolute top-16 left-0 right-0 border-b border-line bg-paper/95 backdrop-blur shadow-[var(--shadow-card)] overflow-hidden transition-all duration-300 ease-[var(--ease-cap)]",
          open ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex flex-col p-4 gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 rounded-md text-sm font-medium text-cocoa hover:bg-cream transition-colors"
            >
              {label}
            </Link>
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
