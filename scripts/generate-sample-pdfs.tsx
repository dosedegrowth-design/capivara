/**
 * Script: gera PDFs de exemplo para todos os 14 planos.
 * Saida: ~/Downloads/capivara-pdfs/
 *
 * Uso:
 *   npx tsx scripts/generate-sample-pdfs.tsx
 */

import { mkdir } from "fs/promises";
import { join, resolve } from "path";
import { homedir } from "os";

// IMPORTANTE: env NODE_PDF_FONTS_DIR e setada via comando externo
// (ver package.json npm script "gen:pdfs") pra garantir que esta presente
// antes de Font.register ser chamado no import do template.

import { renderToFile } from "@react-pdf/renderer";
import { RelatorioPDF } from "../src/lib/pdf/template";
import { generateMockResult } from "../src/lib/consultas/mock-data";
import { TODOS_PLANOS } from "../src/lib/consultas/planos";

const OUTPUT_DIR = join(homedir(), "Downloads", "capivara-pdfs");

const TARGETS = {
  cpf: "12345678900",
  cnpj: "12345678000190",
  veicular: "ABC1D23",
};

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log(`\nGerando PDFs em: ${OUTPUT_DIR}\n`);

  for (const plano of TODOS_PLANOS) {
    const target = TARGETS[plano.categoria];
    const result = generateMockResult(plano.categoria, plano.id, target);

    const targetFormatted = formatTarget(plano.categoria, target);
    const consultationId = `mock-${plano.id}-${Date.now()}`;
    const filename = `${plano.categoria}-${plano.nome.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
    const filepath = join(OUTPUT_DIR, filename);

    try {
      await renderToFile(
        RelatorioPDF({
          consultationId,
          result,
          targetValue: targetFormatted,
          generatedAt: new Date().toISOString(),
          verificationUrl: `https://capivara-green.vercel.app/verificar/${consultationId}`,
        }),
        filepath
      );
      console.log(`  ok  ${filename}`);
    } catch (err) {
      console.error(`  ERR ${filename}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\nPronto. Abra ${OUTPUT_DIR}\n`);
}

function formatTarget(cat: "cpf" | "cnpj" | "veicular", raw: string): string {
  if (cat === "cpf") return raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (cat === "cnpj") return raw.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return raw.toUpperCase();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
