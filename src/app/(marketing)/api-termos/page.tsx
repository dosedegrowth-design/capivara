import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/legal-document-view";
import { API_TERMS, hashDocument } from "@/lib/legal/documents";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://capivara-green.vercel.app";

export const metadata: Metadata = {
  title: "Termos da API · Capivara",
  description:
    "Termos específicos pra uso da API pública /v1/*. Regras de chave, rate limit, webhook, segurança.",
  alternates: { canonical: `${SITE}/api-termos` },
};

export default function APITermosPage() {
  return <LegalDocumentView doc={API_TERMS} hash={hashDocument(API_TERMS)} />;
}
