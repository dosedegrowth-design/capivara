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

const RESUMO_INCLUI: Record<string, string[]> = {
  "cpf-espiadinha": ["Dados cadastrais básicos"],
  "cpf-investigacao": ["+ Endereços, telefones, e-mails", "Parentes e empresas"],
  "cpf-avancada": ["+ Ultra Completo (400+ bases)", "Score Boa Vista", "Pendências"],
  "cpf-premium": ["+ Serasa Premium", "Certidão Trabalhista", "QUOD"],
  "cpf-raio-x": ["+ SPC + SCR BACEN", "Busca por documentos"],
  "cnpj-espiadinha": ["Razão social, situação, sócios"],
  "cnpj-socios": ["+ CPF Ultra dos sócios", "Certidão Trabalhista"],
  "cnpj-premium": ["+ Cred Plus + Serasa dos sócios"],
  "cnpj-total": ["+ Análise de risco + SCR sócios"],
  "veicular-espiadinha": ["Placa, marca, modelo, Fipe"],
  "veicular-completo": ["+ BIN Nacional + Recall"],
  "veicular-avancado": ["+ Proprietário + Gravame + Roubo/Furto"],
  "veicular-premium": ["+ Leilão + Cert. Segurança + RENAJUD"],
  "veicular-total": ["+ Vip Car + CRLV + Foto Leilão"],
};

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
