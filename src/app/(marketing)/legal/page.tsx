import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ALL_DOCUMENTS, hashDocument } from "@/lib/legal/documents";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://capivara-green.vercel.app";

export const metadata: Metadata = {
  title: "Documentos legais · Capivara",
  description:
    "Termos de Uso, Política de Privacidade, Política de Cookies, Termo de Responsabilidade, Termos B2B e Termos da API.",
  alternates: { canonical: `${SITE}/legal` },
};

const DOC_ORDER: Array<keyof typeof ALL_DOCUMENTS> = [
  "terms_of_use",
  "privacy_policy",
  "consultation_responsibility",
  "company_terms",
  "api_terms",
  "cookie_policy",
];

export default function LegalIndexPage() {
  return (
    <div className="bg-paper">
      <section className="bg-paper-2 border-b border-line py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="outline" className="mb-3 font-mono">
            Documentos legais
          </Badge>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-cocoa">
            Transparência total
          </h1>
          <p className="mt-3 text-tabaco">
            Todos os termos, políticas e contratos da Capivara. Versão atual + hash
            de integridade. Use o histórico em <Link href="/configuracoes/meus-aceites" className="text-fur hover:underline">/configuracoes/meus-aceites</Link> pra ver o que você aceitou e quando.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-3">
          {DOC_ORDER.map((key) => {
            const doc = ALL_DOCUMENTS[key];
            return (
              <Link
                key={key}
                href={doc.publicUrl}
                className="group block rounded-xl border border-line bg-card p-5 hover:border-fur hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-lg bg-fur/15 text-fur flex items-center justify-center shrink-0 group-hover:bg-fur group-hover:text-cream transition-colors">
                    <FileText className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display text-lg font-bold text-cocoa">
                      {doc.title}
                    </h2>
                    <p className="text-xs font-mono text-tabaco mt-1">
                      v{doc.version} · vigência{" "}
                      {new Date(doc.effectiveDate).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-[10px] font-mono text-tabaco/60 mt-1 truncate">
                      SHA-256: {hashDocument(doc).slice(0, 32)}…
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-tabaco group-hover:text-fur group-hover:translate-x-1 transition-all mt-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
