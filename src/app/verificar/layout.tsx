import type { Metadata } from "next";

/**
 * Layout standalone das paginas /verificar/[id].
 *
 * O QR Code impresso no PDF aponta pra ca, entao a pagina precisa
 * funcionar como "selo digital" — sem distracao, sem navbar do site
 * principal, sem cookies banner. So o card de verificacao.
 *
 * noindex global pra nao deixar Google indexar paginas com hash de
 * documentos privados.
 */

export const metadata: Metadata = {
  title: "Verificacao de relatorio",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function VerificarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
