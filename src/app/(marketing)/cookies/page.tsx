import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/legal-document-view";
import { COOKIE_POLICY, hashDocument } from "@/lib/legal/documents";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://capivara-green.vercel.app";

export const metadata: Metadata = {
  title: "Política de Cookies · Capivara",
  description:
    "Como a Capivara usa cookies. Apenas essenciais — sem tracking de terceiros.",
  alternates: { canonical: `${SITE}/cookies` },
};

export default function CookiesPage() {
  return (
    <LegalDocumentView doc={COOKIE_POLICY} hash={hashDocument(COOKIE_POLICY)} />
  );
}
