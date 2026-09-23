/**
 * Validador de invariantes do catalogo.
 *
 * Roda com `npm run validar`. Falha (exit 1) se qualquer regra quebrar.
 * Existe porque o catalogo vive em 3 lugares que precisam concordar:
 *   1. src/lib/consultas/planos.ts      — o que a gente vende
 *   2. src/lib/apifull/mapping.ts       — onde busca o dado e quanto custa
 *   3. supabase/functions/process-consultation/index.ts (PLAN_API_MAP)
 * Divergencia entre eles nao quebra o build: quebra a venda, calada.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  TODOS_PLANOS,
  COMBOS_LEILAO,
  TODOS_PRODUTOS_AVULSO,
  CATALOGO_COMPLETO,
  GRUPOS_CATALOGO,
  margemB2CPercent,
  margemB2BPercent,
  findPlano,
  findProdutoAvulso,
} from "../src/lib/consultas/planos";
import { findEndpoint, custoTotalCentavos } from "../src/lib/apifull/mapping";
import { iconesFaltando } from "../src/components/consulta/icones";

const erros: string[] = [];
const avisos: string[] = [];

function erro(regra: string, detalhe: string) {
  erros.push(`[${regra}] ${detalhe}`);
}
function aviso(regra: string, detalhe: string) {
  avisos.push(`[${regra}] ${detalhe}`);
}

// ---------------------------------------------------------------------------
// 1. Todo SKU vendido tem receita na Edge (senao a consulta paga nao processa)
// ---------------------------------------------------------------------------
const edgeSrc = readFileSync(
  resolve(__dirname, "../supabase/functions/process-consultation/index.ts"),
  "utf-8"
);
const blocoMap = edgeSrc.slice(
  edgeSrc.indexOf("const PLAN_API_MAP"),
  edgeSrc.indexOf("\n};", edgeSrc.indexOf("const PLAN_API_MAP"))
);
const idsNaEdge = new Set(
  [...blocoMap.matchAll(/^\s*"([^"]+)":\s*\[/gm)].map((m) => m[1])
);

for (const item of CATALOGO_COMPLETO) {
  if (!idsNaEdge.has(item.id)) {
    erro("edge-map", `SKU "${item.id}" e vendido mas nao esta no PLAN_API_MAP`);
  }
}
for (const id of idsNaEdge) {
  if (!CATALOGO_COMPLETO.some((i) => i.id === id)) {
    aviso("edge-map", `PLAN_API_MAP tem "${id}" que nao e vendido (orfao)`);
  }
}

// ---------------------------------------------------------------------------
// 2. Toda API citada existe no mapping, e o custo declarado bate com a soma
// ---------------------------------------------------------------------------
for (const p of [...TODOS_PLANOS, ...COMBOS_LEILAO]) {
  for (const api of p.apisIncluidas) {
    if (!findEndpoint(api)) {
      erro("api-existe", `Plano "${p.id}" cita API "${api}" que nao existe no mapping`);
    }
  }
}
for (const prod of TODOS_PRODUTOS_AVULSO) {
  for (const api of prod.apisIncluidas) {
    if (!findEndpoint(api)) {
      erro("api-existe", `Produto "${prod.id}" cita API "${api}" inexistente`);
    }
  }
  const somaReal = custoTotalCentavos(prod.apisIncluidas);
  if (somaReal !== prod.custoApiReal_centavos) {
    erro(
      "custo",
      `"${prod.id}" declara custo ${prod.custoApiReal_centavos} mas as APIs somam ${somaReal}`
    );
  }
}

// ---------------------------------------------------------------------------
// 3. Margem dentro da regra: B2C >= 60%, B2B >= 40%
// ---------------------------------------------------------------------------
for (const prod of TODOS_PRODUTOS_AVULSO) {
  const b2c = margemB2CPercent(prod);
  const b2b = margemB2BPercent(prod);
  if (b2c < 60) erro("margem-b2c", `"${prod.id}" tem margem B2C de ${b2c}% (minimo 60%)`);
  else if (b2c < 70) aviso("margem-b2c", `"${prod.id}" com margem B2C ${b2c}% (alvo 70%)`);
  if (b2b < 40) erro("margem-b2b", `"${prod.id}" tem margem B2B de ${b2b}% (piso 40%)`);
}

// ---------------------------------------------------------------------------
// 4. Coerencia alvo x parametro da API
//    (um produto de CPF nao pode chamar API que pede placa)
//
// Excecao conhecida: plano de CNPJ que tambem perfila os SOCIOS chama API de
// CPF de proposito. Nao e' erro de catalogo — mas a Edge precisa mandar o CPF
// do socio, nao o CNPJ da empresa (ver encadeamento em process-consultation).
// ---------------------------------------------------------------------------
const APIS_SOBRE_SOCIO = new Set([
  "cpf-ultra-socios",
  "scr-bacen-socios",
  "cnd-trabalhista",
  "boa-vista-essencial",
  "serasa-premium",
  "cred-completa-plus",
  "spc-brasil",
]);

for (const item of CATALOGO_COMPLETO) {
  const fonte =
    item.tipo === "avulso" ? findProdutoAvulso(item.id) : findPlano(item.id);
  const apis = fonte?.apisIncluidas ?? [];
  for (const api of apis) {
    const ep = findEndpoint(api);
    if (!ep) continue;
    // documentos/nome aceitam CPF ou CNPJ — nao trava
    if (ep.paramType === "documentos" || ep.paramType === "nome") continue;
    if (ep.paramType !== item.alvo) {
      const ehSocio = item.alvo === "cnpj" && ep.paramType === "cpf" && APIS_SOBRE_SOCIO.has(api);
      if (ehSocio) {
        aviso(
          "alvo-api",
          `"${item.id}" (CNPJ) chama "${api}" que pede CPF — so funciona com o CPF do socio encadeado`
        );
      } else {
        erro(
          "alvo-api",
          `"${item.id}" pede ${item.alvo} mas chama "${api}" que espera ${ep.paramType}`
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Precos: piso, terminacao e unicidade de id
// ---------------------------------------------------------------------------
const vistos = new Set<string>();
for (const item of CATALOGO_COMPLETO) {
  if (vistos.has(item.id)) erro("id-unico", `id "${item.id}" aparece duas vezes`);
  vistos.add(item.id);
  // Piso de R$ 9,99 vale pros avulsos (regra da expansao 09/2026). Planos
  // antigos abaixo disso sao isca de entrada deliberada (CNPJ Espiadinha 7,90).
  if (item.tipo === "avulso" && item.precoB2C_centavos < 999) {
    erro("piso", `avulso "${item.id}" custa ${item.precoB2C_centavos} (piso 999)`);
  }
  if (item.precoB2B_centavos >= item.precoB2C_centavos) {
    erro("b2b-menor", `"${item.id}" tem B2B >= B2C`);
  }
}

// ---------------------------------------------------------------------------
// 6. Icones: nome que nao esta no mapa cai em HelpCircle sem avisar
// ---------------------------------------------------------------------------
const faltando = iconesFaltando([
  ...CATALOGO_COMPLETO.map((i) => i.icon),
  ...GRUPOS_CATALOGO.map((g) => g.icon),
]);
for (const n of faltando) {
  erro("icone", `icone "${n}" usado no catalogo mas nao registrado em icones.ts`);
}

// ---------------------------------------------------------------------------
// 7. Rota: todo href do catalogo tem que resolver pra um arquivo de pagina
// ---------------------------------------------------------------------------
for (const item of CATALOGO_COMPLETO) {
  const partes = item.href.split("/").filter(Boolean); // consultar/xxx/yyy
  if (partes[1] === "avulso") {
    if (!findProdutoAvulso(partes[2])) {
      erro("rota", `href ${item.href} nao resolve em findProdutoAvulso`);
    }
  } else {
    const id = `${partes[1]}-${partes.slice(2).join("-")}`;
    if (!findPlano(id)) {
      erro("rota", `href ${item.href} vira id "${id}" que findPlano nao acha (404)`);
    }
  }
}

// ---------------------------------------------------------------------------
// Relatorio
// ---------------------------------------------------------------------------
console.log(`\nCatalogo: ${CATALOGO_COMPLETO.length} SKUs`);
console.log(
  `  ${TODOS_PLANOS.length} planos · ${COMBOS_LEILAO.length} combos · ${TODOS_PRODUTOS_AVULSO.length} avulsos`
);
console.log(`  ${GRUPOS_CATALOGO.length} grupos na UI\n`);

if (avisos.length) {
  console.log(`AVISOS (${avisos.length}):`);
  avisos.forEach((a) => console.log("  ! " + a));
  console.log("");
}

if (erros.length) {
  console.error(`ERROS (${erros.length}):`);
  erros.forEach((e) => console.error("  x " + e));
  console.error("");
  process.exit(1);
}

console.log("OK — todas as invariantes do catalogo passaram.\n");
