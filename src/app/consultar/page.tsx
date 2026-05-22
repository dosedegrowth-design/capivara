import type { Metadata } from "next";
import Link from "next/link";
import { UserRound, Building2, CarFront, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/capivara/mascot";

export const metadata: Metadata = {
  title: "Consultar · Capivara",
  description: "Escolha o tipo de capivara que você quer puxar.",
};

const CATEGORIAS = [
  {
    href: "/consultar/cpf",
    icon: UserRound,
    title: "CPF",
    description: "Dados cadastrais, score, dívidas, certidões.",
    color: "bg-info/15 text-info",
    starts: "9,90",
  },
  {
    href: "/consultar/cnpj",
    icon: Building2,
    title: "CNPJ",
    description: "Razão social, sócios, certidões, crédito.",
    color: "bg-sage/20 text-sage",
    starts: "7,90",
  },
  {
    href: "/consultar/veicular",
    icon: CarFront,
    title: "Veicular",
    description: "Placa, proprietário, gravame, leilão, recall.",
    color: "bg-saffron/25 text-fur",
    starts: "9,90",
  },
];

export default function ConsultarPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 md:py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="flex justify-center mb-4">
          <Mascot pose="investigando" size={120} animate="idle" />
        </div>
        <Badge variant="outline" className="mb-3 font-mono">
          Passo 1 de 3
        </Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-cocoa">
          Que capivara você quer puxar?
        </h1>
        <p className="mt-3 text-tabaco text-lg">
          Escolha o tipo de consulta. Depois selecione o plano e quanto detalhe quer.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {CATEGORIAS.map(({ href, icon: Icon, title, description, color, starts }) => (
          <Link
            key={title}
            href={href}
            className="group relative flex flex-col rounded-lg border border-line bg-card p-8 transition-all duration-200 ease-[var(--ease-cap)] hover:shadow-[var(--shadow-pop)] hover:-translate-y-1 hover:border-fur/60"
          >
            <div className={`size-14 rounded-md flex items-center justify-center ${color} mb-4`}>
              <Icon className="size-7" strokeWidth={2} />
            </div>
            <h2 className="font-display text-2xl font-bold text-cocoa mb-2">
              {title}
            </h2>
            <p className="text-sm text-tabaco leading-relaxed mb-6 flex-1">
              {description}
            </p>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-tabaco">A partir de</span>
              <span className="text-cocoa font-bold">R$ {starts}</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-cocoa group-hover:text-fur transition-colors">
              Escolher plano
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
