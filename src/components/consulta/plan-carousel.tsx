"use client";

import { Carousel } from "@/components/ui/carousel";
import { PlanCard } from "@/components/consulta/plan-card";
import type { Plano } from "@/lib/consultas/planos";

interface PlanCarouselProps {
  planos: Plano[];
  inclui?: Record<string, string[]>;
  cardWidth?: number;
}

/**
 * Carrossel de planos B2C — sempre inicia centralizado no plano com
 * `destaque === 'popular'` (Avançada CPF, +Sócios CNPJ, Avançado Veicular).
 */
export function PlanCarousel({
  planos,
  inclui = {},
  cardWidth = 300,
}: PlanCarouselProps) {
  const popularIdx = planos.findIndex((p) => p.destaque === "popular");
  const initialIndex = popularIdx >= 0 ? popularIdx : 0;

  return (
    <Carousel cardWidth={cardWidth} initialIndex={initialIndex}>
      {planos.map((p) => (
        <PlanCard key={p.id} plano={p} inclui={inclui[p.id] ?? []} />
      ))}
    </Carousel>
  );
}
