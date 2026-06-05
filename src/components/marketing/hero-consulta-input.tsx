"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, Zap, FileText, AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  formatCPF,
  formatCNPJ,
  formatPlaca,
  normalizeCPF,
  normalizeCNPJ,
  normalizePlaca,
  isValidCPF,
  isValidCNPJ,
  isValidPlaca,
} from "@/lib/formatters";

/**
 * Hero "clone verificaplaca": coluna esquerda com texto + 3 badges,
 * coluna direita com card branco contendo tabs (CPF/CNPJ/Placa) e
 * input grande estilizado por tipo.
 *
 * Submit -> /consultar/{cat}?target={valor-normalizado}.
 */

type CategoriaTab = "cpf" | "cnpj" | "placa";

interface Props {
  /** Qual categoria fica selecionada por padrão. */
  defaultCategoria?: CategoriaTab;
  /** Headline principal (H1 da pagina). */
  h1: string;
  /** Linha de apoio abaixo do H1. */
  subtitle?: string;
  /** Badge text acima do H1. */
  badge?: string;
  /** Tabs disponíveis. Default: todas. */
  categorias?: CategoriaTab[];
  /** Variante visual do background. */
  variant?: "default" | "leilao";
}

export function HeroConsultaInput({
  defaultCategoria = "placa",
  h1,
  subtitle,
  badge,
  categorias = ["cpf", "cnpj", "placa"],
  variant = "default",
}: Props) {
  const router = useRouter();

  // Garante que defaultCategoria esta dentro das `categorias` disponiveis
  const initial = categorias.includes(defaultCategoria)
    ? defaultCategoria
    : categorias[0];

  const [tab, setTab] = React.useState<CategoriaTab>(initial);
  const [cpf, setCpf] = React.useState("");
  const [cnpj, setCnpj] = React.useState("");
  const [placa, setPlaca] = React.useState("");
  const [erro, setErro] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    let categoriaRoute: "cpf" | "cnpj" | "veicular";
    let target: string;

    if (tab === "cpf") {
      if (!isValidCPF(cpf)) {
        setErro("CPF inválido. Confere os 11 dígitos.");
        return;
      }
      categoriaRoute = "cpf";
      target = normalizeCPF(cpf);
    } else if (tab === "cnpj") {
      if (!isValidCNPJ(cnpj)) {
        setErro("CNPJ inválido. Confere os 14 dígitos.");
        return;
      }
      categoriaRoute = "cnpj";
      target = normalizeCNPJ(cnpj);
    } else {
      if (!isValidPlaca(placa)) {
        setErro("Placa inválida. Formato AAA-1234 ou AAA-1B34 (Mercosul).");
        return;
      }
      categoriaRoute = "veicular";
      target = normalizePlaca(placa);
    }

    setSubmitting(true);
    router.push(`/consultar/${categoriaRoute}?target=${target}#planos`);
  }

  const isLeilao = variant === "leilao";

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        isLeilao
          ? "bg-gradient-to-br from-cocoa via-cocoa-2 to-cocoa text-cream"
          : "bg-paper"
      )}
    >
      {/* Background glow */}
      <div
        className={cn(
          "absolute inset-0 -z-0",
          isLeilao
            ? "bg-[radial-gradient(ellipse_at_top_right,_rgba(232,165,71,0.18),_transparent_60%),radial-gradient(ellipse_at_bottom_left,_rgba(196,106,63,0.15),_transparent_60%)]"
            : "bg-gradient-to-br from-saffron/5 via-transparent to-fur/5"
        )}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-8 pb-10 md:pt-12 md:pb-14">
        <div className="grid items-center gap-6 md:gap-10 md:grid-cols-2">
          {/* -------- ESQUERDA: copy -------- */}
          <div className="space-y-4 md:space-y-6">
            {badge && (
              <Badge
                variant={isLeilao ? "default" : "secondary"}
                className={cn(
                  "font-mono",
                  isLeilao && "bg-saffron text-cocoa border-transparent"
                )}
              >
                <span className={cn("mr-1.5", isLeilao ? "text-cocoa" : "text-fur")}>●</span>
                {badge}
              </Badge>
            )}

            <h1
              className={cn(
                "font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]",
                isLeilao ? "text-cream" : "text-cocoa"
              )}
            >
              {h1}
            </h1>

            {subtitle && (
              <p
                className={cn(
                  "text-base sm:text-lg leading-relaxed max-w-xl",
                  isLeilao ? "text-cream/85" : "text-tabaco"
                )}
              >
                {subtitle}
              </p>
            )}

            {/* 3 selos */}
            <div
              className={cn(
                "flex flex-wrap items-center gap-3 sm:gap-4 pt-2 text-[11px] sm:text-xs font-mono",
                isLeilao ? "text-cream/70" : "text-tabaco/80"
              )}
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-ok" /> LGPD compliant
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="size-4 text-saffron" /> Resultado em segundos
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="size-4 text-info" /> PDF assinado
              </span>
            </div>
          </div>

          {/* -------- DIREITA: card de input -------- */}
          <div className="md:order-2">
            <div className="rounded-2xl bg-card border border-line shadow-lg p-5 sm:p-7">
              <Tabs
                value={tab}
                onValueChange={(v) => {
                  setTab(v as CategoriaTab);
                  setErro(null);
                }}
              >
                {categorias.length > 1 && (
                  <TabsList className="w-full grid grid-flow-col auto-cols-fr h-11">
                    {categorias.includes("placa") && (
                      <TabsTrigger value="placa">Placa</TabsTrigger>
                    )}
                    {categorias.includes("cpf") && (
                      <TabsTrigger value="cpf">CPF</TabsTrigger>
                    )}
                    {categorias.includes("cnpj") && (
                      <TabsTrigger value="cnpj">CNPJ</TabsTrigger>
                    )}
                  </TabsList>
                )}

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  {categorias.includes("placa") && (
                    <TabsContent value="placa" className="mt-0 space-y-3">
                      <PlacaInput
                        value={placa}
                        onChange={(v) => {
                          setPlaca(v);
                          setErro(null);
                        }}
                      />
                      <p className="text-[11px] font-mono text-tabaco/70 text-center">
                        Mercosul (AAA-1B23) ou antiga (AAA-1234)
                      </p>
                    </TabsContent>
                  )}

                  {categorias.includes("cpf") && (
                    <TabsContent value="cpf" className="mt-0 space-y-3">
                      <DocumentoInput
                        label="CPF"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(v) => {
                          setCpf(formatCPF(v));
                          setErro(null);
                        }}
                        maxLength={14}
                      />
                    </TabsContent>
                  )}

                  {categorias.includes("cnpj") && (
                    <TabsContent value="cnpj" className="mt-0 space-y-3">
                      <DocumentoInput
                        label="CNPJ"
                        placeholder="00.000.000/0000-00"
                        value={cnpj}
                        onChange={(v) => {
                          setCnpj(formatCNPJ(v));
                          setErro(null);
                        }}
                        maxLength={18}
                      />
                    </TabsContent>
                  )}

                  {erro && (
                    <div className="flex items-start gap-2 rounded-md bg-err/10 border border-err/30 px-3 py-2 text-xs text-err">
                      <AlertCircle className="size-4 shrink-0 mt-0.5" />
                      <span>{erro}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="accent"
                    size="xl"
                    className="w-full"
                    disabled={submitting}
                  >
                    <Search className="size-5" />
                    {submitting ? "Buscando..." : "CONSULTAR"}
                  </Button>

                  <p className="text-[11px] text-tabaco/70 text-center leading-relaxed">
                    Ao consultar você concorda com os{" "}
                    <Link
                      href="/termos"
                      className="text-fur underline-offset-2 hover:underline"
                    >
                      Termos
                    </Link>{" "}
                    e{" "}
                    <Link
                      href="/privacidade"
                      className="text-fur underline-offset-2 hover:underline"
                    >
                      Privacidade
                    </Link>
                    .
                  </p>
                </form>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =========================================================================
// Inputs especializados
// =========================================================================

function DocumentoInput({
  label,
  placeholder,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-mono uppercase tracking-widest text-tabaco">
        {label}
      </label>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full h-14 rounded-lg border-2 border-line bg-paper-2",
          "px-4 text-center text-2xl sm:text-3xl font-mono font-bold text-cocoa tracking-wider",
          "placeholder:text-tabaco/30 placeholder:font-normal",
          "focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/30",
          "transition-all duration-200 ease-[var(--ease-cap)]"
        )}
      />
    </div>
  );
}

/**
 * Input estilizado tipo placa Mercosul:
 * - Faixa azul "BRASIL · MERCOSUL" no topo com bandeira BR
 * - Input grande uppercase ao centro
 */
function PlacaInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative rounded-lg overflow-hidden border-2 border-cocoa shadow-inner bg-white">
      {/* Faixa Mercosul azul */}
      <div className="flex items-center justify-between gap-2 bg-[#1A3C8C] px-3 py-1.5 text-white text-[9px] font-mono uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          {/* Bandeira UE/Mercosul simplificada */}
          <span
            aria-hidden
            className="inline-block size-3 rounded-full bg-[#0F2D6E] border border-white/50"
          />
          <span>Mercosul</span>
        </div>
        <span className="font-bold tracking-[0.3em]">BRASIL</span>
        <div className="flex items-center gap-1.5">
          <span>BR</span>
          {/* Bandeirinha BR simplificada (verde) */}
          <span
            aria-hidden
            className="inline-block size-3 rounded-sm bg-[#009C3B] border border-white/50"
          />
        </div>
      </div>

      <input
        type="text"
        autoComplete="off"
        spellCheck={false}
        placeholder="AAA-1B23"
        value={value}
        onChange={(e) => onChange(formatPlaca(e.target.value))}
        maxLength={8}
        className={cn(
          "w-full h-16 sm:h-20 bg-white",
          "px-4 text-center font-display font-bold tracking-[0.2em]",
          "text-3xl sm:text-4xl text-cocoa uppercase",
          "placeholder:text-tabaco/25 placeholder:tracking-[0.15em]",
          "focus:outline-none focus:bg-saffron/5",
          "transition-colors"
        )}
      />
    </div>
  );
}
