"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanCard } from "@/components/consulta/plan-card";
import type { Plano } from "@/lib/consultas/planos";

interface PlanCarouselProps {
  planos: Plano[];
  inclui?: Record<string, string[]>;
  /** Largura aproximada de cada card (px). */
  cardWidth?: number;
}

/**
 * Carrossel horizontal de planos com scroll-snap.
 *
 * Comportamentos importantes:
 * - Inicia centralizado no plano popular (destaque='popular') —
 *   isso revela o vizinho esquerdo (plano mais barato) e direito (mais completo)
 *   parcialmente, criando affordance natural de "tem mais pra ver"
 * - Mobile: swipe natural
 * - Desktop: setas ← → laterais
 * - overflow-x-clip permite que o badge "Mais popular" saia do card sem ser cortado
 */
export function PlanCarousel({
  planos,
  inclui = {},
  cardWidth = 300,
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
      activeIndex: Math.round(scrollLeft / (cardWidth + 20)),
    });
  }

  function scrollByCards(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (cardWidth + 20), behavior: "smooth" });
  }

  // Posiciona o carrossel no plano popular logo ao montar (sem animacao visivel)
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const popularIdx = planos.findIndex((p) => p.destaque === "popular");
    if (popularIdx <= 0) return;

    // Centraliza o popular: scrollar para que o card popular fique no meio do track
    const cardSpan = cardWidth + 20; // card + gap
    const targetCenter = popularIdx * cardSpan + cardWidth / 2;
    const desiredScroll = targetCenter - el.clientWidth / 2;
    el.scrollLeft = Math.max(0, desiredScroll);
    updateState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planos, cardWidth]);

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
        onClick={() => scrollByCards(-1)}
        disabled={!scrollState.canPrev}
        aria-label="Anterior"
        className={cn(
          "hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20",
          "size-11 rounded-full bg-card border border-line shadow-[var(--shadow-pop)]",
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
        onClick={() => scrollByCards(1)}
        disabled={!scrollState.canNext}
        aria-label="Próximo"
        className={cn(
          "hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20",
          "size-11 rounded-full bg-card border border-line shadow-[var(--shadow-pop)]",
          "items-center justify-center text-cocoa transition-all duration-200",
          "hover:border-fur hover:text-fur hover:scale-105",
          "disabled:opacity-0 disabled:pointer-events-none"
        )}
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Track:
          - overflow-x: scroll horizontal funcionando
          - overflow-y: visible permitido (pra badge -top-3 nao ser cortado)
          - pt-4 reserva espaco vertical pro badge sobreposto */}
      <div
        ref={trackRef}
        className="overflow-x-auto overflow-y-visible scroll-smooth snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pt-4"
      >
        <div className="flex gap-5 pb-5">
          {planos.map((p) => (
            <div
              key={p.id}
              className="snap-center shrink-0"
              style={{ width: `${cardWidth}px` }}
            >
              <PlanCard plano={p} inclui={inclui[p.id] ?? []} />
            </div>
          ))}
          {/* Espaço fantasma no fim e início pra primeiro/último poderem centralizar */}
          <div className="shrink-0 w-2" aria-hidden />
        </div>
      </div>

      {/* Dots (mobile + tablet) */}
      <div className="flex md:hidden justify-center gap-1.5 mt-3">
        {planos.map((_, i) => (
          <span
            key={i}
            className={cn(
              "size-1.5 rounded-full transition-all duration-200",
              scrollState.activeIndex === i
                ? "bg-fur w-5"
                : "bg-line"
            )}
          />
        ))}
      </div>
    </div>
  );
}
