import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PlanCarousel } from "@/components/consulta/plan-carousel";
import {
  PLANOS_CPF,
  PLANOS_CNPJ,
  PLANOS_VEICULAR,
  RESUMO_INCLUI,
  type Plano,
} from "@/lib/consultas/planos";

type CategoriaSlug = "cpf" | "cnpj" | "veicular";

const TITULO: Record<CategoriaSlug, string> = {
  cpf: "Consultar CPF",
  cnpj: "Consultar CNPJ",
  veicular: "Consultar veicular",
};

const PLANOS_POR_CATEGORIA: Record<CategoriaSlug, Plano[]> = {
  cpf: PLANOS_CPF,
  cnpj: PLANOS_CNPJ,
  veicular: PLANOS_VEICULAR,
};

// RESUMO_INCLUI agora vem de @/lib/consultas/planos (fonte unica de verdade)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  const cat = categoria as CategoriaSlug;
  return {
    title: `${TITULO[cat] ?? "Consultar"} · Capivara`,
  };
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const cat = categoria as CategoriaSlug;
  const planos = PLANOS_POR_CATEGORIA[cat];
  if (!planos) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-16">
      <Link
        href="/consultar"
        className="inline-flex items-center gap-2 text-sm text-tabaco hover:text-fur transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Outra categoria
      </Link>

      <div className="max-w-2xl mb-10">
        <Badge variant="outline" className="mb-3 font-mono">
          Passo 2 de 3 · Escolher plano
        </Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-cocoa">
          {TITULO[cat]}
        </h1>
        <p className="mt-3 text-tabaco text-lg">
          Quanto mais completo o plano, mais bases consultadas.
        </p>
      </div>

      <PlanCarousel
        planos={planos}
        inclui={RESUMO_INCLUI}
        cardWidth={300}
      />
    </div>
  );
}

export function generateStaticParams() {
  return [
    { categoria: "cpf" },
    { categoria: "cnpj" },
    { categoria: "veicular" },
  ];
}
