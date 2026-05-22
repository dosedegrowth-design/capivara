"use client";

import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselProps {
  /** Conteúdo: um <div> por item. */
  children: ReactNode[];
  /** Largura aproximada de cada card (px). Padrão 300. */
  cardWidth?: number;
  /** Gap entre cards em px. Padrão 20. */
  gap?: number;
  /** Índice do card para começar centralizado. */
  initialIndex?: number;
  /** Mostrar dots indicadores em mobile. */
  showDots?: boolean;
  /** Cor de fundo da página (usado no gradient de fade nas bordas).
   *  Use 'paper' para fundo paper, 'paper-2' para áreas cinzas, etc. */
  fadeColor?: "paper" | "paper-2" | "card";
  className?: string;
}

/**
 * Carrossel horizontal genérico com:
 * - scroll-snap-mandatory + snap-center
 * - overflow-y visível (badges sobrepostos saem do card sem corte)
 * - Setas ← → POSICIONADAS FORA dos cards (espaço lateral reservado)
 * - Fade gradient nas bordas indicando "tem mais conteúdo"
 * - Dots em mobile
 * - posicionamento inicial em `initialIndex`
 */
export function Carousel({
  children,
  cardWidth = 300,
  gap = 20,
  initialIndex = 0,
  showDots = true,
  fadeColor = "paper",
  className,
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    canPrev: false,
    canNext: true,
    activeIndex: initialIndex,
  });

  const cardSpan = cardWidth + gap;

  function updateState() {
    const el = trackRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const max = el.scrollWidth - el.clientWidth;
    setScrollState({
      canPrev: scrollLeft > 8,
      canNext: scrollLeft < max - 8,
      activeIndex: Math.round(scrollLeft / cardSpan),
    });
  }

  function scrollByCards(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * cardSpan, behavior: "smooth" });
  }

  useEffect(() => {
    if (initialIndex <= 0) {
      updateState();
      return;
    }

    // Aplicar o scroll em uma sequencia de tentativas — o layout pode demorar
    // alguns frames pra estabilizar (especialmente com fontes carregando).
    function applyScroll() {
      const el = trackRef.current;
      if (!el) return;
      const targetCenter = initialIndex * cardSpan + cardWidth / 2;
      const desiredScroll = Math.max(0, targetCenter - el.clientWidth / 2);
      // Desativa temporariamente scroll-smooth pra setar instantaneo
      const prevBehavior = el.style.scrollBehavior;
      el.style.scrollBehavior = "auto";
      el.scrollLeft = desiredScroll;
      el.style.scrollBehavior = prevBehavior;
      updateState();
    }

    // Tentativa imediata + 2 retries pra cobrir hidratacao + font swap
    applyScroll();
    const t1 = setTimeout(applyScroll, 0);
    const t2 = setTimeout(applyScroll, 100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIndex, cardWidth, gap]);

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

  // Mapa de cores hex para os gradients (Tailwind arbitrary values precisam de string completa)
  const fadeFrom =
    fadeColor === "paper-2"
      ? "from-paper-2"
      : fadeColor === "card"
      ? "from-card"
      : "from-paper";

  return (
    /* px-12 reserva espaço lateral pras setas ficarem totalmente fora dos cards.
       Em mobile (sem setas) some pra ganhar largura. */
    <div className={cn("relative md:px-12", className)}>
      {/* Botão esquerda (fora dos cards, no espaço reservado) */}
      <button
        type="button"
        onClick={() => scrollByCards(-1)}
        disabled={!scrollState.canPrev}
        aria-label="Anterior"
        className={cn(
          "hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-30",
          "size-11 rounded-full bg-card border border-line shadow-[var(--shadow-pop)]",
          "items-center justify-center text-cocoa transition-all duration-200",
          "hover:border-fur hover:text-fur hover:scale-105",
          "disabled:opacity-0 disabled:pointer-events-none"
        )}
      >
        <ChevronLeft className="size-5" />
      </button>

      {/* Botão direita (fora dos cards, no espaço reservado) */}
      <button
        type="button"
        onClick={() => scrollByCards(1)}
        disabled={!scrollState.canNext}
        aria-label="Próximo"
        className={cn(
          "hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-30",
          "size-11 rounded-full bg-card border border-line shadow-[var(--shadow-pop)]",
          "items-center justify-center text-cocoa transition-all duration-200",
          "hover:border-fur hover:text-fur hover:scale-105",
          "disabled:opacity-0 disabled:pointer-events-none"
        )}
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Wrapper do track + fades */}
      <div className="relative">
        {/* Fade esquerdo — indica "tem mais à esquerda" */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-12 md:w-16",
            "bg-gradient-to-r to-transparent transition-opacity duration-300",
            fadeFrom,
            scrollState.canPrev ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Fade direito */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 md:w-16",
            "bg-gradient-to-l to-transparent transition-opacity duration-300",
            fadeFrom,
            scrollState.canNext ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Track */}
        <div
          ref={trackRef}
          className="overflow-x-auto overflow-y-visible scroll-smooth snap-x snap-mandatory scrollbar-hide pt-4"
        >
          <div className="flex pb-5" style={{ gap: `${gap}px` }}>
            {children.map((child, i) => (
              <div
                key={i}
                className="snap-center shrink-0"
                style={{ width: `${cardWidth}px` }}
              >
                {child}
              </div>
            ))}
            <div className="shrink-0 w-2" aria-hidden />
          </div>
        </div>
      </div>

      {/* Dots (mobile) */}
      {showDots && (
        <div className="flex md:hidden justify-center gap-1.5 mt-3">
          {children.map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full transition-all duration-200",
                scrollState.activeIndex === i ? "bg-fur w-5" : "bg-line"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
