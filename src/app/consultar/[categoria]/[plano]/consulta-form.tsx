"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatCPF,
  formatCNPJ,
  formatPlaca,
  normalizeCPF,
  normalizeCNPJ,
  normalizePlaca,
} from "@/lib/formatters";
import {
  iniciarConsultaAction,
  type IniciarConsultaResult,
} from "@/lib/consultas/actions";
import type { Plano } from "@/lib/consultas/planos";

const FINALIDADES_CPF = [
  { id: "credit_analysis", label: "Análise de crédito" },
  { id: "rental_check", label: "Verificação para locação" },
  { id: "employment_check", label: "Contratação (RH)" },
  { id: "commercial_relation", label: "Relação comercial" },
  { id: "identity_verification", label: "Verificar identidade" },
  { id: "self_check", label: "Consulta a mim mesmo" },
  { id: "other", label: "Outros (descrever)" },
];

const FINALIDADES_CNPJ = [
  { id: "credit_analysis", label: "Análise de crédito empresarial" },
  { id: "due_diligence", label: "Due diligence" },
  { id: "supplier_check", label: "Verificar fornecedor" },
  { id: "partnership_check", label: "Verificar sócio" },
  { id: "self_check", label: "Própria empresa" },
  { id: "other", label: "Outros (descrever)" },
];

const FINALIDADES_VEICULAR = [
  { id: "pre_purchase", label: "Antes de comprar" },
  { id: "pre_sale", label: "Antes de vender" },
  { id: "insurance_check", label: "Análise para seguro" },
  { id: "financing_check", label: "Análise para financiamento" },
  { id: "own_vehicle", label: "Meu próprio veículo" },
  { id: "other", label: "Outros (descrever)" },
];

export function ConsultaForm({
  plano,
  responsibilityVersion,
}: {
  plano: Plano;
  responsibilityVersion: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [target, setTarget] = useState("");
  const [finalidade, setFinalidade] = useState("");
  const [finalidadeDescricao, setFinalidadeDescricao] = useState("");
  const [paymentType, setPaymentType] = useState<"pix" | "boleto" | "cartao_avista">("pix");
  const [acceptResponsibility, setAcceptResponsibility] = useState(false);

  const finalidades =
    plano.categoria === "cpf"
      ? FINALIDADES_CPF
      : plano.categoria === "cnpj"
      ? FINALIDADES_CNPJ
      : FINALIDADES_VEICULAR;

  const targetLabel =
    plano.categoria === "cpf"
      ? "CPF"
      : plano.categoria === "cnpj"
      ? "CNPJ"
      : "Placa do veículo";
  const targetPlaceholder =
    plano.categoria === "cpf"
      ? "000.000.000-00"
      : plano.categoria === "cnpj"
      ? "00.000.000/0000-00"
      : "AAA-0A00";

  function formatTarget(v: string) {
    if (plano.categoria === "cpf") return formatCPF(v);
    if (plano.categoria === "cnpj") return formatCNPJ(v);
    return formatPlaca(v);
  }

  function action(formData: FormData) {
    setErro(null);
    setFieldErrors({});
    formData.set("planoId", plano.id);
    formData.set(
      "target",
      plano.categoria === "cpf"
        ? normalizeCPF(target)
        : plano.categoria === "cnpj"
        ? normalizeCNPJ(target)
        : normalizePlaca(target)
    );
    formData.set("finalidade", finalidade);
    formData.set("finalidadeDescricao", finalidadeDescricao);
    formData.set("paymentType", paymentType);
    formData.set("acceptResponsibility", acceptResponsibility ? "true" : "false");
    formData.set("responsibilityVersion", responsibilityVersion);

    if (!acceptResponsibility) {
      setErro("Você precisa aceitar o termo de responsabilidade.");
      return;
    }

    startTransition(async () => {
      const result: IniciarConsultaResult = await iniciarConsultaAction(formData);
      if (!result.ok) {
        setErro(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }
      router.push(`/consultar/aguardando/${result.consultationId}`);
    });
  }

  return (
    <form action={action} className="space-y-6">
      {/* Target */}
      <div className="space-y-2">
        <Label htmlFor="target">{targetLabel}</Label>
        <Input
          id="target"
          name="target"
          value={formatTarget(target)}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={targetPlaceholder}
          inputMode={plano.categoria === "veicular" ? "text" : "numeric"}
          autoComplete="off"
          required
          className="font-mono text-lg"
        />
        {fieldErrors.target && (
          <p className="text-xs text-err">{fieldErrors.target}</p>
        )}
      </div>

      {/* Finalidade LGPD */}
      <div className="space-y-2">
        <Label htmlFor="finalidade">Finalidade da consulta (LGPD)</Label>
        <p className="text-xs text-tabaco">
          A lei exige declaração de finalidade. Escolha a opção que melhor descreve seu caso.
        </p>
        <select
          id="finalidade"
          value={finalidade}
          onChange={(e) => setFinalidade(e.target.value)}
          required
          className="flex h-11 w-full rounded-md border border-line bg-paper-2 px-3 text-sm text-cocoa focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        >
          <option value="">Selecionar finalidade...</option>
          {finalidades.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
        {fieldErrors.finalidade && (
          <p className="text-xs text-err">{fieldErrors.finalidade}</p>
        )}

        {finalidade === "other" && (
          <div className="space-y-1 mt-2">
            <Textarea
              id="finalidadeDescricao"
              value={finalidadeDescricao}
              onChange={(e) => setFinalidadeDescricao(e.target.value)}
              placeholder="Descreva brevemente a finalidade..."
              rows={3}
              required
            />
            {fieldErrors.finalidadeDescricao && (
              <p className="text-xs text-err">{fieldErrors.finalidadeDescricao}</p>
            )}
          </div>
        )}
      </div>

      {/* Pagamento */}
      <div className="space-y-2">
        <Label>Forma de pagamento</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "pix", label: "PIX", emoji: "⚡", desc: "Instantâneo" },
            { id: "boleto", label: "Boleto", emoji: "📋", desc: "Até 2 dias" },
            { id: "cartao_avista", label: "Cartão", emoji: "💳", desc: "À vista" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPaymentType(opt.id as typeof paymentType)}
              className={`p-3 rounded-md border text-center transition-all duration-200 ${
                paymentType === opt.id
                  ? "border-fur ring-1 ring-fur/30 bg-saffron/10"
                  : "border-line bg-paper-2 hover:border-fur/40"
              }`}
            >
              <div className="text-2xl">{opt.emoji}</div>
              <div className="font-display text-sm font-bold text-cocoa mt-1">
                {opt.label}
              </div>
              <div className="text-[10px] text-tabaco font-mono">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* TERMO DE RESPONSABILIDADE — OBRIGATORIO */}
      <div className="rounded-lg border-2 border-saffron/40 bg-saffron/5 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <Lock className="size-4 text-saffron shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="text-cocoa font-semibold mb-1">
              Termo de Responsabilidade por Consulta (LGPD)
            </p>
            <p className="text-tabaco">
              Antes de prosseguir, declare que tem finalidade legítima e
              assume responsabilidade pelo uso dos dados. Este aceite é
              registrado com seu IP, horário e versão do documento.
            </p>
          </div>
        </div>

        <label
          htmlFor="acceptResponsibility"
          className="flex items-start gap-3 cursor-pointer bg-card rounded-md border border-line p-3"
        >
          <Checkbox
            id="acceptResponsibility"
            checked={acceptResponsibility}
            onCheckedChange={(v) => setAcceptResponsibility(Boolean(v))}
            className="mt-0.5"
          />
          <div className="text-xs leading-relaxed">
            <span className="text-cocoa">
              <span className="text-red-600 mr-0.5">*</span>
              <strong>Declaro</strong> ter base legal (LGPD Art. 7º) e
              finalidade legítima pra esta consulta. Assumo integralmente a
              responsabilidade pelo uso dos dados obtidos, isentando a
              Capivara de qualquer responsabilidade pelo uso após o download
              do relatório.{" "}
              <Link
                href="/responsabilidade-consulta"
                target="_blank"
                className="text-fur font-medium hover:underline"
              >
                Ler termo completo (v{responsibilityVersion})
              </Link>
            </span>
          </div>
        </label>
      </div>

      {/* LGPD reassurance */}
      <div className="flex items-start gap-2 rounded-md bg-cream/60 border border-line p-3 text-xs">
        <Lock className="size-4 text-fur shrink-0 mt-0.5" />
        <p className="text-tabaco leading-relaxed">
          Esta consulta + aceite ficam registrados por 5 anos (logs LGPD).
          Dados consultados ficam acessíveis por 90 dias e depois são
          anonimizados automaticamente.
        </p>
      </div>

      {erro && (
        <div className="rounded-md border border-err/30 bg-err/10 px-3 py-2 text-sm text-err">
          {erro}
        </div>
      )}

      <Button
        type="submit"
        variant="accent"
        size="xl"
        className="w-full"
        disabled={pending || !acceptResponsibility}
      >
        {pending
          ? "Criando cobrança..."
          : !acceptResponsibility
          ? "Aceite o termo acima pra continuar"
          : `Puxar capivara · ir para pagamento`}
      </Button>
    </form>
  );
}
