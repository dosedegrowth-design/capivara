import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/legal-document-view";
import { COMPANY_TERMS, hashDocument } from "@/lib/legal/documents";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://capivara-green.vercel.app";

export const metadata: Metadata = {
  title: "Termos B2B / Empresa · Capivara",
  description:
    "Termos de Uso Empresarial (B2B). Complementa os Termos gerais com cláusulas específicas pra pessoa jurídica.",
  alternates: { canonical: `${SITE}/empresa-termos` },
};

export default function EmpresaTermosPage() {
  return (
    <LegalDocumentView doc={COMPANY_TERMS} hash={hashDocument(COMPANY_TERMS)} />
  );
}
