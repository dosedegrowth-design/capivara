/**
 * Testes das regras anti-fraude puras (sem banco).
 * Roda com `npm run test:fraude`.
 */
import {
  regraDocumentoDeTeste,
  regraAutoconsultaDivergente,
  regraVarreduraPorIp,
  regraBlocklist,
  decidir,
} from "../../src/lib/anti-fraude/regras";

let ok = 0, fail = 0;
function t(nome: string, real: unknown, esperado: unknown) {
  if (JSON.stringify(real) === JSON.stringify(esperado)) ok++;
  else { fail++; console.log(`  X ${nome}\n    esperado ${JSON.stringify(esperado)}\n    real     ${JSON.stringify(real)}`); }
}

// documento de teste
t("CNPJ do BB sinaliza", regraDocumentoDeTeste("00000000000191")?.acao, "sinalizar");
t("documento de teste nunca bloqueia", regraDocumentoDeTeste("11111111111")?.acao, "sinalizar");
t("CPF normal nao sinaliza", regraDocumentoDeTeste("52998224725"), null);

// autoconsulta
t("self_check com CPF do cadastro passa",
  regraAutoconsultaDivergente("self_check", "52998224725", "529.982.247-25"), null);
t("self_check com outro CPF sinaliza",
  regraAutoconsultaDivergente("self_check", "11144477735", "529.982.247-25")?.regra,
  "autoconsulta_divergente");
t("outra finalidade nao dispara",
  regraAutoconsultaDivergente("credit_analysis", "11144477735", "529.982.247-25"), null);
t("sem CPF no cadastro nao dispara",
  regraAutoconsultaDivergente("self_check", "11144477735", null), null);
t("cadastro com mascara diferente ainda confere",
  regraAutoconsultaDivergente("self_check", "52998224725", "52998224725"), null);

// varredura por IP
t("9 alvos: nada", regraVarreduraPorIp(9), null);
t("10 alvos: sinaliza", regraVarreduraPorIp(10)?.acao, "sinalizar");
t("24 alvos: sinaliza", regraVarreduraPorIp(24)?.acao, "sinalizar");
t("25 alvos: bloqueia", regraVarreduraPorIp(25)?.acao, "bloquear");
t("0 alvos: nada", regraVarreduraPorIp(0), null);

// blocklist
t("blocklist bloqueia", regraBlocklist({ tipo: "documento", motivo: "abuso" })?.acao, "bloquear");
t("blocklist sem motivo tem descricao", !!regraBlocklist({ tipo: "ip", motivo: null })?.descricao, true);
t("sem entrada na blocklist", regraBlocklist(null), null);

// decisao combinada: o mais severo manda
const sSinal = regraDocumentoDeTeste("11111111111")!;
const sBloq = regraBlocklist({ tipo: "user", motivo: "x" })!;
t("so sinal -> sinalizar", decidir([sSinal]), "sinalizar");
t("sinal + bloqueio -> bloquear", decidir([sSinal, sBloq]), "bloquear");
t("nenhum sinal -> permitir", decidir([]), "permitir");

console.log(`\n${ok} passaram, ${fail} falharam`);
process.exit(fail ? 1 : 0);
