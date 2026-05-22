"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Checkbox de aceite legal reusable.
 *
 * Mostra:
 *  - Checkbox
 *  - Label com texto curto + link pro documento completo
 *  - (Opcional) Preview expandível do texto
 *
 * O componente NÃO submete sozinho — ele controla o estado de "aceito"
 * e expõe via prop `onCheckedChange`. A form pai usa esse estado pra
 * habilitar/desabilitar o submit + envia hidden inputs com os IDs/hashes
 * pro server action registrar via logConsent.
 */
export interface TermsAcceptanceProps {
  /** ID DOM do checkbox (pra label) */
  id: string;
  /** Nome do hidden input que vai pro formData (ex: "acceptedTerms") */
  name: string;
  /** Texto principal do checkbox */
  label: string;
  /** URL do documento completo */
  documentUrl: string;
  /** Versão do documento (vai pro formData) */
  documentVersion: string;
  /** Hash do documento (vai pro formData, integridade) */
  documentHash: string;
  /** Tipo do documento (vai pro formData) */
  documentType: string;
  /** Callback quando muda */
  onCheckedChange?: (checked: boolean) => void;
  /** Estado controlado (opcional) */
  checked?: boolean;
  /** Marca como obrigatório (asterisco visual) */
  required?: boolean;
  /** Variante de cor */
  variant?: "default" | "warning";
}

export function TermsAcceptance({
  id,
  name,
  label,
  documentUrl,
  documentVersion,
  documentHash,
  documentType,
  onCheckedChange,
  checked: controlledChecked,
  required = true,
  variant = "default",
}: TermsAcceptanceProps) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const checked = controlledChecked ?? uncontrolled;

  function handleChange(v: boolean) {
    if (controlledChecked === undefined) setUncontrolled(v);
    onCheckedChange?.(v);
  }

  const containerClass =
    variant === "warning"
      ? "rounded-lg border-2 border-saffron/40 bg-saffron/5 p-4"
      : "rounded-lg border border-line bg-paper-2/40 p-4";

  return (
    <div className={containerClass}>
      <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(v) => handleChange(Boolean(v))}
          className="mt-0.5"
        />
        <div className="flex-1 text-sm leading-relaxed">
          <span className="text-cocoa">
            {required && <span className="text-red-600 mr-1">*</span>}
            {label}{" "}
            <Link
              href={documentUrl}
              target="_blank"
              rel="noopener"
              className="text-fur hover:underline inline-flex items-center gap-0.5 font-medium"
            >
              Ler documento completo
              <ExternalLink className="size-3" />
            </Link>
          </span>
          <p className="text-[10px] font-mono text-tabaco mt-1.5">
            v{documentVersion} · hash {documentHash.slice(0, 12)}…
          </p>
        </div>
      </label>

      {/* Hidden inputs pra server action ler */}
      <input
        type="hidden"
        name={`${name}.documentType`}
        value={documentType}
      />
      <input
        type="hidden"
        name={`${name}.documentVersion`}
        value={documentVersion}
      />
      <input
        type="hidden"
        name={`${name}.documentHash`}
        value={documentHash}
      />
      <input
        type="hidden"
        name={name}
        value={checked ? "true" : "false"}
      />
    </div>
  );
}

/**
 * Box maior com 2-3 aceites legais agrupados visualmente (ex: signup com
 * ToS + Privacy + LGPD opcional).
 */
export function TermsAcceptanceGroup({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <div className="space-y-3">
      {(title || description) && (
        <div className="flex items-start gap-2">
          <ShieldCheck className="size-4 text-fur mt-0.5 shrink-0" />
          <div>
            {title && (
              <h3 className="text-sm font-display font-semibold text-cocoa">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-tabaco mt-0.5">{description}</p>
            )}
          </div>
        </div>
      )}
      <div className="space-y-2">{children}</div>
    </div>
  );
}
