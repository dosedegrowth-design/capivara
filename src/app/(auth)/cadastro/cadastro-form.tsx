"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCPF } from "@/lib/formatters";
import { signUpAction } from "@/lib/auth/actions";

export function CadastroForm({
  tipoInicial,
  toSVersion,
  privacyVersion,
}: {
  tipoInicial: "pf" | "empresa";
  toSVersion: string;
  privacyVersion: string;
}) {
  const [erro, setErro] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [tipo, setTipo] = useState<"pf" | "empresa">(tipoInicial);
  const [cpf, setCpf] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function action(formData: FormData) {
    setErro(null);
    setFieldErrors({});
    formData.set("tipo", tipo);
    formData.set("cpf", cpf);
    const result = await signUpAction(formData);
    if (result.error) {
      setErro(result.error);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
    }
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      {/* Tipo de conta */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-cream rounded-md">
        {(["pf", "empresa"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setTipo(opt)}
            className={`text-xs font-medium py-2 px-3 rounded transition-all duration-200 ${
              tipo === opt
                ? "bg-cocoa text-cream shadow-sm"
                : "text-tabaco hover:text-cocoa"
            }`}
          >
            {opt === "pf" ? "Pessoa física" : "Empresa"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nomeCompleto">Nome completo</Label>
        <Input
          id="nomeCompleto"
          name="nomeCompleto"
          placeholder="Como aparece no documento"
          autoComplete="name"
          required
        />
        {fieldErrors.nomeCompleto && (
          <p className="text-xs text-err">{fieldErrors.nomeCompleto}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf">CPF</Label>
        <Input
          id="cpf"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={formatCPF(cpf)}
          onChange={(e) => setCpf(e.target.value)}
          required
        />
        {fieldErrors.cpf && (
          <p className="text-xs text-err">{fieldErrors.cpf}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="voce@email.com"
          autoComplete="email"
          required
        />
        {fieldErrors.email && (
          <p className="text-xs text-err">{fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone (opcional)</Label>
        <Input
          id="telefone"
          name="telefone"
          type="tel"
          placeholder="(11) 99999-9999"
          autoComplete="tel"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <div className="relative">
          <Input
            id="senha"
            name="senha"
            type={mostrarSenha ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
            minLength={8}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-tabaco hover:text-fur transition-colors"
            tabIndex={-1}
          >
            {mostrarSenha ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {fieldErrors.senha && (
          <p className="text-xs text-err">{fieldErrors.senha}</p>
        )}
      </div>

      {/* Aceite de Termos de Uso */}
      <div className="flex items-start gap-2 pt-2">
        <Checkbox id="acceptTOS" name="acceptTOS" required />
        <label
          htmlFor="acceptTOS"
          className="text-xs text-tabaco leading-relaxed cursor-pointer select-none"
        >
          <span className="text-red-600 mr-0.5">*</span>
          Li e aceito os{" "}
          <Link
            href="/termos"
            target="_blank"
            className="text-fur underline-offset-4 hover:underline"
          >
            Termos de Uso
          </Link>
          {" "}da Capivara (v{toSVersion})
        </label>
      </div>

      {/* Aceite de Política de Privacidade */}
      <div className="flex items-start gap-2">
        <Checkbox id="acceptPrivacy" name="acceptPrivacy" required />
        <label
          htmlFor="acceptPrivacy"
          className="text-xs text-tabaco leading-relaxed cursor-pointer select-none"
        >
          <span className="text-red-600 mr-0.5">*</span>
          Li e aceito a{" "}
          <Link
            href="/privacidade"
            target="_blank"
            className="text-fur underline-offset-4 hover:underline"
          >
            Política de Privacidade
          </Link>
          {" "}(LGPD, v{privacyVersion})
        </label>
      </div>

      <input type="hidden" name="lgpdAceito" value="on" />

      {fieldErrors.acceptTOS && (
        <p className="text-xs text-err">{fieldErrors.acceptTOS}</p>
      )}
      {fieldErrors.acceptPrivacy && (
        <p className="text-xs text-err">{fieldErrors.acceptPrivacy}</p>
      )}

      {erro && (
        <div className="rounded-md border border-err/30 bg-err/10 px-3 py-2 text-sm text-err">
          {erro}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      className="w-full"
      disabled={pending}
    >
      {pending ? "Criando conta..." : "Criar conta"}
    </Button>
  );
}
