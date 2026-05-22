"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanCard } from "@/components/consulta/plan-card";
import type { Plano } from "@/lib/consultas/planos";

interface PlanCarouselProps {
  planos: Plano[];
  inclui?: Record<string, string[]>;
  /** Largura aproximada de cada card (px). Cards menores = mais cards visíveis. */
  cardWidth?: number;
}

/**
 * Carrossel horizontal de planos com scroll-snap.
 *
 * - Mobile: swipe natural
 * - Desktop: setas ← → no canto + atalhos do teclado
 * - Cards menores (≈260px) para caber ~4 em telas grandes
 * - Indicador de paginação por dots em mobile
 */
export function PlanCarousel({
  planos,
  inclui = {},
  cardWidth = 260,
}: PlanCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    canPrev: false,
    canNext: true,
    activeIndex: 0,
  });

  function updateState() {
    const el = trackRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const max = el.scrollWidth - el.clientWidth;
    setScrollState({
      canPrev: scrollLeft > 8,
      canNext: scrollLeft < max - 8,
      activeIndex: Math.round(scrollLeft / (cardWidth + 16)),
    });
  }

  function scrollBy(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    // Pula 1 card por clique
    el.scrollBy({ left: direction * (cardWidth + 16), behavior: "smooth" });
  }

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateState();
    el.addEventListener("scroll", updateState, { passive: true });
    window.addEventListener("resize", updateState);
    return () => {
      el.removeEventListener("scroll", updateState);
      window.removeEventListener("resize", updateState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      {/* Botão esquerda (desktop) */}
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        disabled={!scrollState.canPrev}
        aria-label="Anterior"
        className={cn(
          "hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10",
          "size-10 rounded-full bg-card border border-line shadow-[var(--shadow-card)]",
          "items-center justify-center text-cocoa transition-all duration-200",
          "hover:border-fur hover:text-fur hover:scale-105",
          "disabled:opacity-0 disabled:pointer-events-none"
        )}
      >
        <ChevronLeft className="size-5" />
      </button>

      {/* Botão direita (desktop) */}
      <button
        type="button"
        onClick={() => scrollBy(1)}
        disabled={!scrollState.canNext}
        aria-label="Próximo"
        className={cn(
          "hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10",
          "size-10 rounded-full bg-card border border-line shadow-[var(--shadow-card)]",
          "items-center justify-center text-cocoa transition-all duration-200",
          "hover:border-fur hover:text-fur hover:scale-105",
          "disabled:opacity-0 disabled:pointer-events-none"
        )}
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        className="overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
        style={{ scrollPaddingLeft: "4px", scrollPaddingRight: "4px" }}
      >
        <div className="flex gap-4 pb-4">
          {planos.map((p) => (
            <div
              key={p.id}
              className="snap-start shrink-0"
              style={{ width: `${cardWidth}px` }}
            >
              <PlanCard plano={p} inclui={inclui[p.id] ?? []} />
            </div>
          ))}
          {/* Espaço fantasma no fim para o último card poder snapar à esquerda */}
          <div className="shrink-0 w-1" aria-hidden />
        </div>
      </div>

      {/* Dots (mobile) */}
      <div className="flex md:hidden justify-center gap-1.5 mt-2">
        {planos.map((_, i) => (
          <span
            key={i}
            className={cn(
              "size-1.5 rounded-full transition-all duration-200",
              scrollState.activeIndex === i
                ? "bg-fur w-4"
                : "bg-line"
            )}
          />
        ))}
      </div>
    </div>
  );
}
