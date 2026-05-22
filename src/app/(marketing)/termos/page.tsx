import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/legal-document-view";
import { TERMS_OF_USE, hashDocument } from "@/lib/legal/documents";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://capivara-green.vercel.app";

export const metadata: Metadata = {
  title: "Termos de Uso · Capivara",
  description: "Termos de Uso da plataforma Capivara. Versão atual e histórico de versões.",
  alternates: { canonical: `${SITE}/termos` },
};

export default function TermosPage() {
  return <LegalDocumentView doc={TERMS_OF_USE} hash={hashDocument(TERMS_OF_USE)} />;
}
