"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCNPJ, normalizeCNPJ } from "@/lib/formatters";
import { criarEmpresaAction } from "@/lib/auth/actions";

export function CriarEmpresaForm({ companyTermsVersion }: { companyTermsVersion: string }) {
  const [erro, setErro] = useState<string | null>(null);
  const [cnpj, setCnpj] = useState("");
  const [acceptCompanyTerms, setAcceptCompanyTerms] = useState(false);

  async function action(formData: FormData) {
    setErro(null);
    if (!acceptCompanyTerms) {
      setErro("Você precisa aceitar os Termos B2B.");
      return;
    }
    formData.set("cnpj", normalizeCNPJ(cnpj));
    formData.set("acceptCompanyTerms", "true");
    const result = await criarEmpresaAction(formData);
    if (result.error) setErro(result.error);
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="razaoSocial">Razão social</Label>
        <Input
          id="razaoSocial"
          name="razaoSocial"
          placeholder="Como aparece no CNPJ"
          required
          minLength={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nomeFantasia">
          Nome fantasia <span className="text-tabaco/60 font-normal">(opcional)</span>
        </Label>
        <Input
          id="nomeFantasia"
          name="nomeFantasia"
          placeholder="Como você quer que apareça no painel"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input
          id="cnpj"
          inputMode="numeric"
          placeholder="00.000.000/0000-00"
          value={formatCNPJ(cnpj)}
          onChange={(e) => setCnpj(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emailBilling">
          E-mail de cobrança <span className="text-tabaco/60 font-normal">(opcional)</span>
        </Label>
        <Input
          id="emailBilling"
          name="emailBilling"
          type="email"
          placeholder="financeiro@empresa.com"
        />
        <p className="text-xs text-tabaco/70">
          Pra onde as NF-e e recibos serão enviados. Se vazio, usamos seu email pessoal.
        </p>
      </div>

      {/* Aceite compacto dos Termos B2B */}
      <label
        htmlFor="acceptCompanyTerms"
        className="flex items-start gap-2.5 cursor-pointer rounded-md border border-line bg-paper-2/40 p-3 hover:bg-paper-2/60 transition-colors"
      >
        <Checkbox
          id="acceptCompanyTerms"
          checked={acceptCompanyTerms}
          onCheckedChange={(v) => setAcceptCompanyTerms(Boolean(v))}
          className="mt-0.5"
        />
        <span className="text-xs text-tabaco leading-relaxed">
          Sou representante legal autorizado e aceito os{" "}
          <Link
            href="/empresa-termos"
            target="_blank"
            className="text-fur hover:underline"
          >
            Termos B2B
          </Link>
          .
        </span>
      </label>

      {erro && (
        <div className="rounded-md border border-err/30 bg-err/10 px-3 py-2 text-sm text-err">
          {erro}
        </div>
      )}

      <SubmitButton disabled={!acceptCompanyTerms} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      className="w-full"
      disabled={pending || disabled}
    >
      {pending ? "Criando empresa..." : "Criar empresa"}
    </Button>
  );
}
