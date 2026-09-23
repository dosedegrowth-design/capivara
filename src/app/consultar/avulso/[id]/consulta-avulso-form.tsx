"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatPlaca,
  normalizePlaca,
  formatCPF,
  normalizeCPF,
  formatCNPJ,
  normalizeCNPJ,
  formatCEP,
  normalizeCEP,
} from "@/lib/formatters";
import {
  iniciarConsultaAvulsoAction,
  type IniciarConsultaResult,
} from "@/lib/consultas/actions";
import { alvoDoProduto, type ProdutoAvulso } from "@/lib/consultas/planos";
import { track } from "@/lib/analytics";
import { RevisaoConsulta } from "@/components/consulta/revisao-consulta";

const LABEL_PAGAMENTO: Record<string, string> = {
  pix: "PIX · confirma em segundos",
  boleto: "Boleto · até 2 dias úteis",
  cartao_avista: "Cartão à vista",
};

const FINALIDADES_VEICULAR = [
  { id: "pre_purchase", label: "Antes de comprar" },
  { id: "pre_sale", label: "Antes de vender" },
  { id: "insurance_check", label: "Análise para seguro" },
  { id: "financing_check", label: "Análise para financiamento" },
  { id: "own_vehicle", label: "Meu próprio veículo" },
  { id: "other", label: "Outros (descrever)" },
];

const FINALIDADES_LEILAO = [
  { id: "pre_purchase", label: "Antes de dar lance / comprar" },
  { id: "pre_sale", label: "Antes de revender" },
  { id: "insurance_check", label: "Análise para seguro" },
  { id: "own_vehicle", label: "Veículo já meu" },
  { id: "other", label: "Outros (descrever)" },
];

const FINALIDADES_CPF = [
  { id: "credit_analysis", label: "Análise de crédito" },
  { id: "rental_check", label: "Verificação para locação" },
  { id: "employment_check", label: "Verificação para contratação (RH)" },
  { id: "commercial_relation", label: "Estabelecer relação comercial" },
  { id: "identity_verification", label: "Verificar identidade" },
  { id: "self_check", label: "Consultar a mim mesmo" },
  { id: "other", label: "Outros (descrever)" },
];

const FINALIDADES_CEP = [
  { id: "commercial_relation", label: "Estudo de mercado / ponto comercial" },
  { id: "credit_analysis", label: "Análise de investimento" },
  { id: "self_check", label: "Minha própria região" },
  { id: "other", label: "Outros (descrever)" },
];

const FINALIDADES_CNPJ = [
  { id: "credit_analysis", label: "Análise de crédito" },
  { id: "due_diligence", label: "Due diligence / auditoria" },
  { id: "supplier_check", label: "Homologação de fornecedor" },
  { id: "partnership_check", label: "Avaliar parceria" },
  { id: "self_check", label: "Minha própria empresa" },
  { id: "other", label: "Outros (descrever)" },
];

export function ConsultaAvulsoForm({
  produto,
  responsibilityVersion,
}: {
  produto: ProdutoAvulso;
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
  // Passo de conferencia antes de gerar a cobranca (LGPD Art. 8 §4 + evita
  // consultar o documento errado).
  const [revisando, setRevisando] = useState(false);

  // O alvo depende da categoria do produto: placa, CPF ou CNPJ.
  const alvo = alvoDoProduto(produto.categoria);

  const finalidades =
    produto.categoria === "cpf"
      ? FINALIDADES_CPF
      : produto.categoria === "cep"
      ? FINALIDADES_CEP
      : produto.categoria === "cnpj"
      ? FINALIDADES_CNPJ
      : produto.categoria === "leilao"
      ? FINALIDADES_LEILAO
      : FINALIDADES_VEICULAR;

  const targetLabel =
    alvo === "cpf"
      ? "CPF"
      : alvo === "cnpj"
      ? "CNPJ"
      : alvo === "cep"
      ? "CEP da região"
      : "Placa do veículo";
  const targetPlaceholder =
    alvo === "cpf"
      ? "000.000.000-00"
      : alvo === "cnpj"
      ? "00.000.000/0000-00"
      : alvo === "cep"
      ? "00000-000"
      : "AAA-0A00";

  const formatTarget =
    alvo === "cpf"
      ? formatCPF
      : alvo === "cnpj"
      ? formatCNPJ
      : alvo === "cep"
      ? formatCEP
      : formatPlaca;
  const normalizeTarget =
    alvo === "cpf"
      ? normalizeCPF
      : alvo === "cnpj"
      ? normalizeCNPJ
      : alvo === "cep"
      ? normalizeCEP
      : normalizePlaca;

  // Submit do formulario NAO cobra: leva pra conferencia.
  function irParaRevisao() {
    setErro(null);
    setFieldErrors({});

    if (!acceptResponsibility) {
      setErro("Você precisa aceitar o termo de responsabilidade.");
      return;
    }

    track("consulta_revisao_avulso", {
      categoria: produto.categoria,
      produto_id: produto.id,
    });
    setRevisando(true);
  }

  // So aqui a cobranca e criada.
  function confirmar() {
    setErro(null);
    const formData = new FormData();
    formData.set("produtoId", produto.id);
    formData.set("target", normalizeTarget(target));
    formData.set("finalidade", finalidade);
    formData.set("finalidadeDescricao", finalidadeDescricao);
    formData.set("paymentType", paymentType);
    formData.set("acceptResponsibility", acceptResponsibility ? "true" : "false");
    formData.set("responsibilityVersion", responsibilityVersion);

    track("consulta_iniciada_avulso", {
      categoria: produto.categoria,
      produto_id: produto.id,
      payment_type: paymentType,
    });

    startTransition(async () => {
      const result: IniciarConsultaResult = await iniciarConsultaAvulsoAction(formData);
      if (!result.ok) {
        setErro(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        // Erro de campo so da pra corrigir no formulario.
        if (result.fieldErrors) setRevisando(false);
        return;
      }
      router.push(`/consultar/aguardando/${result.consultationId}`);
    });
  }

  if (revisando) {
    return (
      <RevisaoConsulta
        nomeProduto={produto.nome}
        alvoLabel={targetLabel}
        alvoFormatado={formatTarget(target)}
        finalidadeLabel={
          finalidades.find((f) => f.id === finalidade)?.label ?? finalidade
        }
        finalidadeDescricao={
          finalidade === "other" ? finalidadeDescricao : undefined
        }
        pagamentoLabel={LABEL_PAGAMENTO[paymentType] ?? paymentType}
        valorCentavos={produto.precoB2C_centavos}
        pendente={pending}
        onVoltar={() => setRevisando(false)}
        onConfirmar={confirmar}
        erro={erro}
      />
    );
  }

  return (
    <form action={irParaRevisao} className="space-y-6">
      {/* Target */}
      <div className="space-y-2">
        <Label htmlFor="target">{targetLabel}</Label>
        <Input
          id="target"
          name="target"
          value={formatTarget(target)}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={targetPlaceholder}
          inputMode={alvo === "placa" ? "text" : "numeric"}
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

      {/* Aceite compacto - obrigatorio mas discreto */}
      <label
        htmlFor="acceptResponsibility"
        className="flex items-start gap-2.5 cursor-pointer rounded-md border border-line bg-paper-2/40 p-3 hover:bg-paper-2/60 transition-colors"
      >
        <Checkbox
          id="acceptResponsibility"
          checked={acceptResponsibility}
          onCheckedChange={(v) => setAcceptResponsibility(Boolean(v))}
          className="mt-0.5"
        />
        <span className="text-xs text-tabaco leading-relaxed">
          Tenho finalidade legítima pra esta consulta e aceito o{" "}
          <Link
            href="/responsabilidade-consulta"
            target="_blank"
            className="text-fur hover:underline"
          >
            termo de responsabilidade
          </Link>
          . Entendo que a Capivara só repassa dados de fontes externas e não
          garante a atualidade após a consulta.
        </span>
      </label>

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
        disabled={!acceptResponsibility}
      >
        {!acceptResponsibility
          ? "Aceite o termo acima pra continuar"
          : "Revisar e ir para pagamento"}
      </Button>

      <p className="text-center text-xs text-tabaco">
        Você ainda vai conferir os dados antes de pagar.
      </p>
    </form>
  );
}
