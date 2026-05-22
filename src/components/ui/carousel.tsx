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
  /** Conteúdo: um <div> por item. Será envolvido em wrapper snap-center shrink-0. */
  children: ReactNode[];
  /** Largura aproximada de cada card (px). Padrão 300. */
  cardWidth?: number;
  /** Gap entre cards em px. Padrão 20. */
  gap?: number;
  /** Índice do card para começar centralizado (popular/destaque). 0 = primeiro. */
  initialIndex?: number;
  /** Mostrar dots indicadores em mobile. Padrão true. */
  showDots?: boolean;
  className?: string;
}

/**
 * Carrossel horizontal genérico com:
 * - scroll-snap-mandatory
 * - snap-center (cards centralizam no scroll)
 * - overflow-y visível (pra badges sobrepostos sairem do card sem corte)
 * - botões ← → em desktop (escondem quando ficam invisíveis)
 * - dots em mobile
 * - posicionamento inicial em `initialIndex`
 */
export function Carousel({
  children,
  cardWidth = 300,
  gap = 20,
  initialIndex = 0,
  showDots = true,
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

  // Posiciona no card inicial sem animacao visivel
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el || initialIndex <= 0) return;
    const targetCenter = initialIndex * cardSpan + cardWidth / 2;
    const desiredScroll = targetCenter - el.clientWidth / 2;
    el.scrollLeft = Math.max(0, desiredScroll);
    updateState();
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

  return (
    <div className={cn("relative", className)}>
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

      {/* Track */}
      <div
        ref={trackRef}
        className="overflow-x-auto overflow-y-visible scroll-smooth snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pt-4"
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
