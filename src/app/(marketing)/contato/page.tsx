import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, Phone, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/capivara/mascot";
import { CAPIVARA_CONFIG, identificacaoControladora } from "@/lib/config";
import { ContatoForm } from "./contato-form";

export const metadata: Metadata = {
  title: "Contato · Capivara",
  description:
    "Fale com a equipe da Capivara. Atendimento via WhatsApp, e-mail ou formulário. Vendas para empresas: contato dedicado.",
};

const CANAIS = [
  ...(CAPIVARA_CONFIG.wa
    ? [
        {
          icon: MessageCircle,
          title: "WhatsApp",
          description: "Resposta em horário comercial (seg-sex, 9h às 18h).",
          action: "Abrir conversa",
          href: CAPIVARA_CONFIG.wa,
        },
      ]
    : []),
  {
    icon: Mail,
    title: "E-mail",
    description: "Resposta em até 1 dia útil.",
    action: CAPIVARA_CONFIG.email,
    href: `mailto:${CAPIVARA_CONFIG.email}`,
  },
  ...(CAPIVARA_CONFIG.tel
    ? [
        {
          icon: Phone,
          title: "Telefone (vendas PJ)",
          description: "Apenas para empresas com volume > 5.000 consultas/mês.",
          action: CAPIVARA_CONFIG.tel,
          href: `tel:${CAPIVARA_CONFIG.tel.replace(/\D/g, "")}`,
        },
      ]
    : []),
];

export default function ContatoPage() {
  return (
    <div className="bg-paper">
      <Header />
      <ConteudoPrincipal />
      <Localizacao />
    </div>
  );
}

function Header() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <div className="flex justify-center mb-4">
          <Mascot pose="padrao" size={96} animate="idle" />
        </div>
        <Badge variant="outline" className="mb-3 font-mono">
          Contato
        </Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-cocoa">
          A capivara responde rápido.
        </h1>
        <p className="mt-4 text-tabaco text-lg leading-relaxed">
          Escolha o canal mais conveniente, ou envie uma mensagem pelo formulário.
        </p>
      </div>
    </section>
  );
}

function ConteudoPrincipal() {
  return (
    <section className="pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Canais rápidos */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-cocoa mb-2">
              Canais diretos
            </h2>

            {CANAIS.map(({ icon: Icon, title, description, action, href }) => (
              <a
                key={title}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="block rounded-lg border border-line bg-card p-5 hover:border-fur/50 hover:shadow-[var(--shadow-card)] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-md bg-cream flex items-center justify-center text-fur shrink-0">
                    <Icon className="size-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-cocoa">
                      {title}
                    </h3>
                    <p className="text-sm text-tabaco mt-1">{description}</p>
                    <span className="text-sm font-mono text-fur mt-2 inline-block">
                      {action} →
                    </span>
                  </div>
                </div>
              </a>
            ))}

            <div className="rounded-lg bg-cocoa text-cream p-5 mt-6">
              <p className="text-sm font-mono mb-2">
                <span className="text-saffron">●</span> Pra dúvidas sobre LGPD
              </p>
              <p className="text-sm text-cream/80 leading-relaxed">
                Use o canal exclusivo do DPO em{" "}
                <Link
                  href="/lgpd"
                  className="text-saffron underline-offset-4 hover:underline"
                >
                  /lgpd
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Formulário */}
          <div className="rounded-lg border border-line bg-card p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-cocoa mb-1">
              Envie uma mensagem
            </h2>
            <p className="text-sm text-tabaco mb-6">
              Responderemos no e-mail informado.
            </p>

            <ContatoForm />
          </div>
        </div>
      </div>
    </section>
  );
}

function Localizacao() {
  return (
    <section className="py-12 bg-paper-2 border-t border-line">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-mono text-tabaco">
          <MapPin className="size-4 text-fur" />
          São Paulo · Brasil
        </div>
        <p className="text-xs text-tabaco/70 font-mono mt-2">
          Operado pela {identificacaoControladora()}
        </p>
      </div>
    </section>
  );
}
