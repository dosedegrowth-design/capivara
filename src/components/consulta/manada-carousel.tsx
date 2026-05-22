"use client";

import { Carousel } from "@/components/ui/carousel";
import { ManadaCard } from "@/components/consulta/manada-card";
import type { PacoteManada } from "@/lib/consultas/planos";

interface ManadaCarouselProps {
  pacotes: PacoteManada[];
  /** Índice do pacote a centralizar no carregamento. Padrão 1 (Manada Pro). */
  initialIndex?: number;
  cardWidth?: number;
}

/**
 * Carrossel de pacotes Manada (B2B). Inicia centralizado no "Manada Pro"
 * (índice 1) — o pacote mais escolhido. Cards extremos (Start e Reserva)
 * aparecem em peek nas laterais.
 */
export function ManadaCarousel({
  pacotes,
  initialIndex = 1,
  cardWidth = 300,
}: ManadaCarouselProps) {
  return (
    <Carousel cardWidth={cardWidth} initialIndex={initialIndex}>
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
