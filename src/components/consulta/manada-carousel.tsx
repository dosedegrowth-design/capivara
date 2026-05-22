"use client";

import { Carousel } from "@/components/ui/carousel";
import { ManadaCard } from "@/components/consulta/manada-card";
import type { PacoteManada } from "@/lib/consultas/planos";

interface ManadaCarouselProps {
  pacotes: PacoteManada[];
  initialIndex?: number;
  cardWidth?: number;
  fadeColor?: "paper" | "paper-2" | "card";
}

/**
 * Carrossel de pacotes Manada (B2B). Inicia centralizado no "Manada Pro"
 * (índice 1) — o pacote mais escolhido.
 */
export function ManadaCarousel({
  pacotes,
  initialIndex = 1,
  cardWidth = 300,
  fadeColor = "paper",
}: ManadaCarouselProps) {
  return (
    <Carousel
      cardWidth={cardWidth}
      initialIndex={initialIndex}
      fadeColor={fadeColor}
    >
      {pacotes.map((p, i) => (
        <ManadaCard
          key={p.id}
          pacote={p}
          destaque={i === 1}
          premium={i === pacotes.length - 1}
        />
      ))}
    </Carousel>
  );
}
