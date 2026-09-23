/**
 * Testes do encadeamento de socio (planos CNPJ).
 *
 * Roda com `npm run test:socios`. Nao chama a APIFULL: exercita o extrator
 * contra os formatos de resposta plausiveis e o particionamento contra o
 * catalogo real.
 */
import { extrairSocios, socioPrincipal, cpfValido } from "../../supabase/functions/process-consultation/socios";

// CPFs validos gerados (digito verificador correto)
const A = "52998224725"; // valido
const B = "11144477735"; // valido
const C = "39053344705"; // valido

let ok = 0, fail = 0;
function t(nome: string, real: unknown, esperado: unknown) {
  const r = JSON.stringify(real), e = JSON.stringify(esperado);
  if (r === e) { ok++; } else { fail++; console.log(`  X ${nome}\n    esperado ${e}\n    real     ${r}`); }
}

// sanidade do validador
t("cpf valido", cpfValido(A), true);
t("cpf invalido (sequencia)", cpfValido("11111111111"), false);
t("cnpj nao e cpf", cpfValido("11222333000181"), false);

// formato 1: Receita/qsa
t("qsa receita", socioPrincipal({
  cnpj: "11222333000181",
  qsa: [
    { nome: "Maria Souza", cpf_cnpj_socio: B, qual: "49-Sócio-Administrador" },
    { nome: "Joao Lima", cpf_cnpj_socio: A, qual: "22-Sócio" },
  ],
})?.cpf, B);

// formato 2: socios com documento mascarado
t("cpf mascarado", socioPrincipal({
  socios: [{ nome: "Ana", documento: "390.533.447-05", qualificacao: "Sócio" }],
})?.cpf, C);

// formato 3: aninhado dentro de dados.empresa
t("aninhado", socioPrincipal({
  dados: { empresa: { quadro_societario: [{ nome: "Bruno", cpf: A }] } },
})?.cpf, A);

// formato 4: administrador ganha do primeiro da lista
t("administrador prioriza", socioPrincipal({
  socios: [
    { nome: "Comum", cpf: A, qualificacao: "Sócio" },
    { nome: "Chefe", cpf: B, qualificacao: "Administrador" },
  ],
})?.cpf, B);

// formato 5: socio PJ ignorado, PF aceito
t("socio PJ ignorado", extrairSocios({
  qsa: [
    { nome: "Holding SA", cpf_cnpj_socio: "11222333000181", qual: "Sócio" },
    { nome: "Pedro", cpf_cnpj_socio: A, qual: "Sócio" },
  ],
}).map(s => s.cpf), [A]);

// formato 6: dedup
t("dedup", extrairSocios({
  socios: [{ cpf: A, nome: "X" }],
  representantes: [{ cpf: A, nome: "X de novo" }],
}).length, 1);

// formato 7: sem socio -> null
t("sem socios", socioPrincipal({ cnpj: "11222333000181", razao_social: "Empresa" }), null);

// formato 8: NAO pegar o CPF do proprio titular numa consulta PF
t("titular PF nao vira socio", socioPrincipal({ cpf: A, nome: "Titular" }), null);

// formato 9: array na raiz
t("array raiz", socioPrincipal([{ socios: [{ cpf: B }] }])?.cpf, B);

// formato 10: chave explicita de socio fora de lista
t("cpf_socio solto", socioPrincipal({ empresa: { cpf_socio: A } })?.cpf, A);

// formato 11: lixo nao quebra
t("null", socioPrincipal(null), null);
t("string", socioPrincipal("nada"), null);
t("numero", socioPrincipal(42), null);

// formato 12: ordem preservada no empate
t("ordem no empate", extrairSocios({
  socios: [{ cpf: A }, { cpf: B }, { cpf: C }],
}).map(s => s.cpf), [A, B, C]);

// formato 13: profundidade limite nao estoura
const fundo: any = {}; let cur = fundo;
for (let i = 0; i < 30; i++) { cur.n = {}; cur = cur.n; }
cur.socios = [{ cpf: A }];
t("profundo demais ignora", socioPrincipal(fundo), null);

console.log(`\n${ok} passaram, ${fail} falharam`);
process.exit(fail ? 1 : 0);
