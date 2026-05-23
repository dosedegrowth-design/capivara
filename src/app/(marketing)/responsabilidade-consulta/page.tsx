import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/legal-document-view";
import { CONSULTATION_RESPONSIBILITY, hashDocument } from "@/lib/legal/documents";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

export const metadata: Metadata = {
  title: "Termo de Responsabilidade por Consulta · Capivara",
  description:
    "Termo aceito antes de cada consulta. Declaração de base legal LGPD e responsabilização do usuário pelo uso dos dados.",
  alternates: { canonical: `${SITE}/responsabilidade-consulta` },
  robots: { index: true, follow: true },
};

export default function ResponsabilidadeConsultaPage() {
  return (
    <LegalDocumentView
      doc={CONSULTATION_RESPONSIBILITY}
      hash={hashDocument(CONSULTATION_RESPONSIBILITY)}
    />
  );
}
