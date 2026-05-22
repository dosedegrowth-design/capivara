import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/legal-document-view";
import { PRIVACY_POLICY, hashDocument } from "@/lib/legal/documents";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://capivara-green.vercel.app";

export const metadata: Metadata = {
  title: "Política de Privacidade · Capivara",
  description:
    "Como a Capivara coleta, usa, armazena e protege seus dados pessoais. LGPD-compliant.",
  alternates: { canonical: `${SITE}/privacidade` },
};

export default function PrivacidadePage() {
  return (
    <LegalDocumentView doc={PRIVACY_POLICY} hash={hashDocument(PRIVACY_POLICY)} />
  );
}
