/** Testes do extrator de UF do veiculo (Edge). `npm run test:uf` */
import { extrairUfVeiculo } from "../../supabase/functions/process-consultation/uf";

let ok = 0, fail = 0;
function t(n: string, r: unknown, e: unknown) {
  if (JSON.stringify(r) === JSON.stringify(e)) ok++;
  else { fail++; console.log(`  X ${n}\n    esperado ${JSON.stringify(e)}\n    real     ${JSON.stringify(r)}`); }
}
t("uf simples", extrairUfVeiculo({ placa: "ABC1D23", uf: "sp" }), "SP");
t("aninhado", extrairUfVeiculo({ dados: { veiculo: { uf: "MG" } } }), "MG");
t("uf_placa ganha de uf generica", extrairUfVeiculo({ uf: "RJ", veiculo: { uf_placa: "PR" } }), "PR");
t("municipio/UF", extrairUfVeiculo({ municipio: "CURITIBA/PR" }), "PR");
t("municipio - UF", extrairUfVeiculo({ cidade: "Goiânia - GO" }), "GO");
t("sigla invalida ignorada", extrairUfVeiculo({ uf: "XX" }), null);
t("nada", extrairUfVeiculo({ placa: "ABC1D23" }), null);
t("null", extrairUfVeiculo(null), null);
t("array raiz", extrairUfVeiculo([{ dados: { UF: "BA" } }]), "BA");
t("valor nao string", extrairUfVeiculo({ uf: 35 }), null);
console.log(`\n${ok} passaram, ${fail} falharam`);
process.exit(fail ? 1 : 0);
