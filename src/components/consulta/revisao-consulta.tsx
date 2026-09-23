"use client";

import { AlertTriangle, Lock, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/formatters";

/**
 * Passo de conferencia antes de gerar a cobranca.
 *
 * Existe por dois motivos:
 *  - LGPD Art. 8 §4: o consentimento precisa ser especifico e informado. O
 *    cliente tem que ver, em uma tela so, QUEM vai ser consultado, COM QUE
 *    finalidade e QUANTO custa — antes de confirmar.
 *  - Digito trocado no CPF/placa significa consultar um terceiro errado e
 *    perder a consulta paga. Conferir e mais barato que estornar.
 */
export function RevisaoConsulta({
  nomeProduto,
  alvoLabel,
  alvoFormatado,
  finalidadeLabel,
  finalidadeDescricao,
  pagamentoLabel,
  valorCentavos,
  pendente,
  onVoltar,
  onConfirmar,
  erro,
}: {
  nomeProduto: string;
  alvoLabel: string;
  alvoFormatado: string;
  finalidadeLabel: string;
  finalidadeDescricao?: string;
  pagamentoLabel: string;
  valorCentavos: number;
  pendente: boolean;
  onVoltar: () => void;
  onConfirmar: () => void;
  erro?: string | null;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-fur/40 bg-saffron/5 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="size-5 text-fur shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display text-lg font-bold text-cocoa">
              Confira antes de pagar
            </h2>
            <p className="mt-1 text-sm text-tabaco leading-relaxed">
              A consulta roda em bases externas assim que o pagamento é
              confirmado. Um dígito trocado consulta outra pessoa — e a consulta
              não volta.
            </p>
          </div>
        </div>
      </div>

      <dl className="rounded-lg border border-line bg-card divide-y divide-line/60">
        <Linha rotulo="Consulta" valor={nomeProduto} />
        <Linha rotulo={alvoLabel} valor={alvoFormatado} destaque />
        <Linha
          rotulo="Finalidade declarada"
          valor={
            finalidadeDescricao
              ? `${finalidadeLabel} — ${finalidadeDescricao}`
              : finalidadeLabel
          }
        />
        <Linha rotulo="Pagamento" valor={pagamentoLabel} />
        <div className="flex items-baseline justify-between gap-4 px-5 py-4">
          <dt className="text-xs font-mono uppercase tracking-wider text-tabaco">
            Total
          </dt>
          <dd className="font-display text-2xl font-bold text-cocoa">
            {formatBRL(valorCentavos)}
          </dd>
        </div>
      </dl>

      <p className="text-xs text-tabaco leading-relaxed">
        Ao confirmar, você declara que a finalidade acima é verdadeira. A
        consulta e a finalidade ficam registradas no seu histórico, como a LGPD
        exige.
      </p>

      {erro && (
        <div className="rounded-md border border-err/30 bg-err/10 px-3 py-2 text-sm text-err">
          {erro}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <Button
          type="button"
          variant="secondary"
          size="xl"
          onClick={onVoltar}
          disabled={pendente}
          className="sm:flex-1"
        >
          <Pencil className="size-4" />
          Corrigir
        </Button>
        <Button
          type="button"
          variant="accent"
          size="xl"
          onClick={onConfirmar}
          disabled={pendente}
          className="sm:flex-[2]"
        >
          <Lock className="size-4" />
          {pendente ? "Criando cobrança..." : "Confirmar e pagar"}
        </Button>
      </div>
    </div>
  );
}

function Linha({
  rotulo,
  valor,
  destaque,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-3">
      <dt className="text-xs font-mono uppercase tracking-wider text-tabaco shrink-0">
        {rotulo}
      </dt>
      <dd
        className={
          destaque
            ? "font-mono text-lg font-bold text-cocoa text-right break-all"
            : "text-sm text-cocoa text-right"
        }
      >
        {valor}
      </dd>
    </div>
  );
}
