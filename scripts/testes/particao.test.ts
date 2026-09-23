import { particionarPorAlvo } from "../../supabase/functions/process-consultation/socios";
import { findEndpoint } from "../../src/lib/apifull/mapping";
import { findPlano, CATALOGO_COMPLETO, findProdutoAvulso } from "../../src/lib/consultas/planos";

const pt = (i: string) => findEndpoint(i)?.paramType;
let ok = 0, fail = 0;
function t(n: string, r: unknown, e: unknown) {
  if (JSON.stringify(r) === JSON.stringify(e)) ok++;
  else { fail++; console.log(`  X ${n}\n    esperado ${JSON.stringify(e)}\n    real     ${JSON.stringify(r)}`); }
}

// endpoint desconhecido vai pro grupo direto (cai no erro existente)
t("desconhecido -> direta", particionarPorAlvo(["nao-existe"], "cnpj", pt), { diretas: ["nao-existe"], deSocio: [] });

// consulta de CPF nunca encadeia
t("cpf nao encadeia", particionarPorAlvo(["cpf-ultra-socios","boa-vista-essencial"], "cpf", pt).deSocio, []);

// consulta de placa nunca encadeia
t("placa nao encadeia", particionarPorAlvo(["fipe","placa-basica"], "placa", pt).deSocio, []);

// Percorre o catalogo de verdade: em CNPJ, nenhuma API de CPF pode sobrar no grupo direto
let vazamentos: string[] = [];
let encadeadas = 0;
for (const item of CATALOGO_COMPLETO) {
  const fonte = item.tipo === "avulso" ? findProdutoAvulso(item.id) : findPlano(item.id);
  const apis = fonte?.apisIncluidas ?? [];
  const { diretas, deSocio } = particionarPorAlvo(apis, item.alvo, pt);
  encadeadas += deSocio.length;
  for (const a of diretas) {
    const p = findEndpoint(a)?.paramType;
    if (p && p !== item.alvo && p !== "documentos" && p !== "nome") {
      vazamentos.push(`${item.id} -> ${a} (${p} != ${item.alvo})`);
    }
  }
  // nada pode sumir nem duplicar
  if (diretas.length + deSocio.length !== apis.length) {
    vazamentos.push(`${item.id}: perdeu API na particao`);
  }
}
t("nenhuma API incompativel sobra no grupo direto", vazamentos, []);
console.log(`  (${encadeadas} chamadas passam a rodar com CPF do socio)`);

console.log(`\n${ok} passaram, ${fail} falharam`);
process.exit(fail ? 1 : 0);
