/**
 * Gera supabase/functions/process-consultation/catalogo.ts a partir do
 * catalogo do site (mapping.ts + planos.ts).
 *
 * Por que existe: ate 12/11/2026 a lista de endpoints e o PLAN_API_MAP eram
 * copiados A MAO dentro da Edge. Os custos divergiram e a correcao do gravame
 * nunca teria chegado la. Agora a Edge importa este arquivo gerado.
 *
 *   npm run gerar:edge          -> reescreve o arquivo
 *   npm run gerar:edge -- --check -> falha se o arquivo estiver desatualizado
 *                                    (roda dentro do `npm run check`)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { APIFULL_ENDPOINTS, CRLV_UF_CODIGO } from "../src/lib/apifull/mapping";
import {
  TODOS_PLANOS,
  COMBOS_LEILAO,
  TODOS_PRODUTOS_AVULSO,
} from "../src/lib/consultas/planos";

const destino = resolve(__dirname, "../supabase/functions/process-consultation/catalogo.ts");

const endpoints = APIFULL_ENDPOINTS.map((e) => ({
  internal: e.internal,
  path: e.path,
  nome: e.nome,
  categoria: e.categoria,
  paramType: e.paramType,
  ...(e.uf ? { uf: e.uf } : {}),
  custoCentavos: e.custoCentavos,
  cacheTTLHours: e.cacheTTLHours,
}));

const planApiMap: Record<string, string[]> = {};
for (const p of [...TODOS_PLANOS, ...COMBOS_LEILAO, ...TODOS_PRODUTOS_AVULSO]) {
  planApiMap[p.id] = p.apisIncluidas;
}

// Um item por linha: arquivo menor e diff legivel.
const linhas = (arr: unknown[]) => "[\n" + arr.map((x) => "  " + JSON.stringify(x)).join(",\n") + "\n]";
const mapa = (obj: Record<string, unknown>) =>
  "{\n" + Object.entries(obj).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n") + "\n}";

const conteudo = `// ARQUIVO GERADO — nao editar a mao.
// Fonte: src/lib/apifull/mapping.ts + src/lib/consultas/planos.ts
// Regenerar: npm run gerar:edge
/* eslint-disable */

export interface ApiFullEndpoint {
  internal: string;
  path: string;
  nome: string;
  categoria: string;
  paramType: "placa" | "parametro" | "cpf" | "cnpj" | "cep" | "nome" | "documentos";
  uf?: "escolhida" | "do-veiculo";
  custoCentavos: number;
  cacheTTLHours: number;
}

// [internal, path, nome, categoria, paramType, custoCentavos, cacheTTLHours, uf?]
type Tupla = [string, string, string, string, ApiFullEndpoint["paramType"], number, number, ApiFullEndpoint["uf"]?];
const TUPLAS: Tupla[] = ${linhas(endpoints.map((e) => [e.internal, e.path, e.nome, e.categoria, e.paramType, e.custoCentavos, e.cacheTTLHours, ...(e.uf ? [e.uf] : [])]))};

export const APIFULL_ENDPOINTS: ApiFullEndpoint[] = TUPLAS.map(
  ([internal, path, nome, categoria, paramType, custoCentavos, cacheTTLHours, uf]) =>
    ({ internal, path, nome, categoria, paramType, custoCentavos, cacheTTLHours, ...(uf ? { uf } : {}) })
);

export const PLAN_API_MAP: Record<string, string[]> = ${mapa(planApiMap)};

export const CRLV_UF_CODIGO: Record<string, string> = ${JSON.stringify(CRLV_UF_CODIGO)};

export function findEndpoint(internal: string): ApiFullEndpoint | undefined {
  return APIFULL_ENDPOINTS.find((e) => e.internal === internal);
}
`;

if (process.argv.includes("--check")) {
  const atual = existsSync(destino) ? readFileSync(destino, "utf-8") : "";
  if (atual !== conteudo) {
    console.error("x catalogo.ts da Edge esta desatualizado — rode `npm run gerar:edge` e suba a Edge.");
    process.exit(1);
  }
  console.log("OK — catalogo da Edge em dia com o site.");
} else {
  writeFileSync(destino, conteudo);
  console.log(`gerado: ${Object.keys(planApiMap).length} SKUs, ${endpoints.length} endpoints`);
}
