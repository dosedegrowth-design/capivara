/* eslint-disable jsx-a11y/alt-text */
/**
 * APIFULL render helpers — converte o shape `result_jsonb` que vem
 * da Edge Function `process-consultation` v6+ em blocos visuais
 * pro PDF (React-PDF).
 *
 * Shape esperado:
 *   {
 *     _generated_at: ISO,
 *     category: "veicular" | "cpf" | "cnpj",
 *     plan_tier: string,
 *     target: string,
 *     sections: {
 *       [apiInternalName]: {
 *         nome: string,
 *         categoria: string,
 *         status: "sucesso" | "cached" | "not_found" | "erro" | "rate_limited" | "timeout" | "internal_error",
 *         dados: unknown | null,
 *         error: string | null,
 *       }
 *     }
 *   }
 *
 * O legado (mock-data.ts) usa `sections: ResultSection[]` — array.
 * Esse modulo NAO trata o legado, mas exporta `isApifullResult()` pra
 * permitir o template detectar e fazer fallback.
 */
import { Text, View, StyleSheet, Svg, Path, Circle } from "@react-pdf/renderer";

// ============================================================
// Paleta (espelho do template.tsx)
// ============================================================
const c = {
  cocoa: "#1F1611",
  fur: "#C46A3F",
  tabaco: "#8E4628",
  saffron: "#E8A547",
  cream: "#F4EAD8",
  paper: "#FBF6EC",
  paper2: "#FFFCF5",
  line: "#E6D8BD",
  ok: "#5E7C4F",
  warn: "#D78A1E",
  err: "#B23A2A",
  info: "#527090",
  muted: "#8E8779",
};

// ============================================================
// Tipos publicos
// ============================================================

export type ApifullStatus =
  | "sucesso"
  | "cached"
  | "not_found"
  | "erro"
  | "rate_limited"
  | "timeout"
  | "internal_error";

export interface ApifullSection {
  nome: string;
  categoria: string;
  status: ApifullStatus;
  dados: unknown | null;
  error: string | null;
}

export interface ApifullResult {
  _generated_at: string;
  category: string;
  plan_tier: string;
  target: string;
  sections: Record<string, ApifullSection>;
}

/** Discrimina shape antigo (array, mock) vs novo (objeto APIFULL). */
export function isApifullResult(value: unknown): value is ApifullResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (!v.sections || typeof v.sections !== "object") return false;
  if (Array.isArray(v.sections)) return false;
  return true;
}

// ============================================================
// Styles
// ============================================================

const s = StyleSheet.create({
  section: {
    marginBottom: 14,
    borderRadius: 6,
    backgroundColor: c.paper2,
    borderLeftWidth: 3,
    borderLeftColor: c.fur,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: c.cream,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: c.cocoa,
    flex: 1,
  },
  sectionBadge: {
    fontSize: 7,
    fontFamily: "Courier-Bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    color: "#FFFFFF",
  },
  sectionBadgeOk: { backgroundColor: c.ok },
  sectionBadgeWarn: { backgroundColor: c.warn },
  sectionBadgeErr: { backgroundColor: c.err },
  sectionBadgeMuted: { backgroundColor: c.muted },
  sectionBadgeInfo: { backgroundColor: c.info },

  sectionBody: { padding: 14, paddingTop: 12 },

  kvRow: {
    flexDirection: "row",
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: c.line,
  },
  kvKey: {
    width: "42%",
    fontSize: 8,
    letterSpacing: 0.6,
    color: c.tabaco,
    paddingRight: 8,
    paddingTop: 1,
  },
  kvValue: { width: "58%", fontSize: 10, color: c.cocoa },
  kvValueOk: { color: c.ok, fontFamily: "Helvetica-Bold" },
  kvValueWarn: { color: c.warn, fontFamily: "Helvetica-Bold" },
  kvValueErr: { color: c.err, fontFamily: "Helvetica-Bold" },

  emptyBox: {
    backgroundColor: "#5E7C4F1A",
    borderColor: "#5E7C4F4D",
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyText: { fontSize: 9, color: c.ok, fontFamily: "Helvetica-Bold" },

  /** Destaque do codigo de barras — e' o que o cliente usa pra pagar. */
  barrasBox: {
    backgroundColor: "#1F16110A",
    borderWidth: 1,
    borderColor: "#C46A3F55",
    borderRadius: 4,
    padding: 8,
    marginVertical: 6,
  },
  barrasLabel: {
    fontSize: 7,
    color: "#C46A3F",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  barrasValor: {
    fontSize: 10,
    color: "#1F1611",
    fontFamily: "Courier-Bold",
    letterSpacing: 0.5,
  },

  /** Cabecalho de cada item em lista de registros (multas, restricoes...). */
  itemHeader: {
    fontSize: 8,
    color: c.fur,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 10,
    marginBottom: 5,
    paddingLeft: 2,
  },

  unavailableBox: {
    backgroundColor: "#8E87791A",
    borderColor: "#8E87794D",
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
  },
  unavailableText: {
    fontSize: 9,
    color: c.muted,
    fontFamily: "Helvetica-Bold",
  },
  unavailableSub: {
    fontSize: 7.5,
    color: c.muted,
    marginTop: 2,
    fontFamily: "Courier",
  },

  noteText: {
    fontSize: 8,
    color: c.tabaco,
    lineHeight: 1.4,
    fontStyle: "italic",
  },
});

// ============================================================
// Helpers
// ============================================================

/** UPPER_SNAKE_CASE / camelCase -> "Title Case". */
function humanize(key: string): string {
  if (!key) return "";
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function stringifyValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Sim" : "Não";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return v;
  if (Array.isArray(v)) {
    if (v.length === 0) return "—";
    if (v.every((x) => typeof x === "string" || typeof x === "number")) {
      return v.join(", ");
    }
    return `${v.length} item(s)`;
  }
  // objeto: representa com JSON limitado
  try {
    return JSON.stringify(v);
  } catch {
    return "—";
  }
}

/** Status -> {label, variant}. */
function statusBadge(status: ApifullStatus): {
  label: string;
  variant: "ok" | "warn" | "err" | "muted" | "info";
} {
  switch (status) {
    case "sucesso":
      return { label: "OK", variant: "ok" };
    case "cached":
      return { label: "CACHE", variant: "info" };
    case "not_found":
      return { label: "SEM REGISTRO", variant: "muted" };
    case "rate_limited":
      return { label: "INDISPONIVEL", variant: "warn" };
    case "timeout":
      return { label: "TIMEOUT", variant: "warn" };
    case "internal_error":
      return { label: "ERRO", variant: "err" };
    case "erro":
      return { label: "ERRO", variant: "err" };
    default:
      return { label: String(status).toUpperCase(), variant: "muted" };
  }
}

// ============================================================
// Renderizadores especificos por API
// ============================================================

interface RenderArgs {
  dados: unknown;
}

function KVList({
  entries,
}: {
  entries: Array<[string, string | null]>;
}) {
  return (
    <View>
      {entries.map(([k, v], i) => {
        const last = i === entries.length - 1;
        return (
          <View
            key={`${k}-${i}`}
            style={[
              s.kvRow,
              ...(last
                ? [{ borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }]
                : []),
            ]}
          >
            <Text style={s.kvKey}>{k}</Text>
            <Text style={s.kvValue}>{v ?? "—"}</Text>
          </View>
        );
      })}
    </View>
  );
}


// ============================================================
// Deteccao por PADRAO (nao por nome exato de campo)
//
// A APIFULL nao documenta o formato de `dados` — cada endpoint devolve o que
// quer. Em vez de escrever um renderizador por endpoint (que exigiria conhecer
// os campos de cada um), reconhecemos PADROES no nome + no valor. Isso vale
// pros ~87 endpoints de hoje e pros que vierem depois.
// ============================================================

/** Normaliza chave pra comparar: minuscula, sem acento, sem separador. */
function chaveNorm(k: string): string {
  return k
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// "total" sozinho e' ambiguo (TotalPendencias = contagem, nao dinheiro):
// so trata como moeda quando o nome e' inequivoco OU quando o numero tem casa
// decimal. Contagem inteira com nome de quantidade fica como numero.
const RE_MONETARIO = /(valor|preco|montante|saldo|renda|patrimonio|faturamento|capital|mensalidade|parcela)/;
const RE_MONETARIO_FRACO = /(debito|divida|multa|taxa|ipva|custo|limite|total)/;
const RE_CONTAGEM = /(qtd|quantidade|numero|count|total(pendencias|ocorrencias|registros|protestos|consultas|itens))/;
const RE_DATA = /(data|dt|emissao|validade|vencimento|nascimento|cadastro|atualizacao|inclusao|ocorrencia|abertura|em$)/;
const RE_DOC = /(cpf|cnpj|documento|placa|renavam|chassi|protocolo|inscricao)/;
const RE_BARRAS = /(codigobarras|linhadigitavel|barcode|codigopagamento|digitavel)/;
const RE_LINK = /(url|link|pdf|imagem|foto|arquivo|href|anexo)/;
const RE_SITUACAO = /(situacao|status|resultado|condicao|restricao|possui|existe|consta|regular|ativo|resultado)/;

/** Valor parece data ISO ou dd/mm/aaaa? */
function pareceData(v: unknown): boolean {
  if (typeof v !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}/.test(v) || /^\d{2}\/\d{2}\/\d{4}/.test(v);
}

function formatarDataBR(v: string): string {
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  return v.slice(0, 10);
}

/**
 * Converte string numerica em number, detectando o separador decimal.
 *
 * A APIFULL pode mandar "1284.55" (americano) ou "1.284,55" (brasileiro).
 * Tratar ponto sempre como separador de milhar multiplicava o valor por 100 —
 * "1284.55" virava R$ 128.455,00.
 */
export function paraNumero(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;

  const bruto = v.replace(/R\$/gi, "").trim();
  if (!/\d/.test(bruto)) return null;
  if (!/^-?[\d.,\s]+$/.test(bruto)) return null;

  const semEspaco = bruto.replace(/\s/g, "");
  const temVirgula = semEspaco.includes(",");
  const temPonto = semEspaco.includes(".");

  let normalizado: string;
  if (temVirgula && temPonto) {
    // O separador decimal e' o que aparece POR ULTIMO
    normalizado =
      semEspaco.lastIndexOf(",") > semEspaco.lastIndexOf(".")
        ? semEspaco.replace(/\./g, "").replace(",", ".")
        : semEspaco.replace(/,/g, "");
  } else if (temVirgula) {
    // So virgula = decimal brasileiro
    normalizado = semEspaco.replace(",", ".");
  } else if (temPonto) {
    // So ponto: 1 ou 2 casas depois do ultimo ponto = decimal ("1284.55").
    // Mais de um ponto, ou exatamente 3 casas, = separador de milhar ("1.284").
    const partes = semEspaco.split(".");
    const ultima = partes[partes.length - 1];
    normalizado =
      partes.length === 2 && ultima.length > 0 && ultima.length <= 2
        ? semEspaco
        : semEspaco.replace(/\./g, "");
  } else {
    normalizado = semEspaco;
  }

  const n = Number(normalizado);
  return Number.isFinite(n) ? n : null;
}

/** Formata numero como BRL. Aceita number ou string numerica. */
function formatarBRL(v: unknown): string | null {
  const n = paraNumero(v);
  if (n === null) return null;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Semantica de situacao: em consulta de risco, "nada consta" e' BOM e
 * "consta" e' RUIM — o oposto do senso comum de "positivo".
 */
function corDaSituacao(texto: string): "ok" | "err" | "warn" | null {
  const t = chaveNorm(texto);
  if (!t) return null;
  const bom = /(nadaconsta|negativa|regular|semrestricao|semocorrencia|semdebito|semapontamento|ativa|adimplente|liberado|semprotesto|naoconsta|inexistente|semregistro)/;
  const ruim = /(positiva|irregular|comrestricao|comdebito|inadimplente|bloqueado|suspensa|baixada|inapta|cancelada|protestado|comapontamento|roubo|furto|sinistro|leilao)/;
  if (bom.test(t)) return "ok";
  if (ruim.test(t)) return "err";
  return null;
}

export type CampoFormatado = {
  label: string;
  valor: string;
  /** Destaque visual especial (codigo de barras, situacao critica). */
  realce?: "barras" | "ok" | "err" | "warn";
  /** Ordem semantica: identificacao < situacao < valores < datas < resto. */
  peso: number;
};

/** Aplica heuristica a um par chave/valor. */
function formatarCampo(k: string, v: unknown): CampoFormatado | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "object") return null; // tratado fora

  const kn = chaveNorm(k);
  const label = humanize(k);

  // 1. Codigo de barras — o dado mais acionavel de uma consulta de debito
  if (RE_BARRAS.test(kn) && typeof v === "string" && v.replace(/\D/g, "").length >= 20) {
    return { label, valor: v, realce: "barras", peso: 1 };
  }

  // 2. Link / documento
  if (RE_LINK.test(kn) && typeof v === "string" && /^https?:\/\//.test(v)) {
    return { label, valor: v, peso: 6 };
  }

  // 3. Booleano — em consulta de risco, `true` costuma ser ocorrencia (ruim)
  if (typeof v === "boolean") {
    const ehRisco = /(restricao|debito|protesto|roubo|furto|divida|pendencia|bloqueio|gravame|multa|obito|sinistro)/.test(kn);
    return {
      label,
      valor: v ? "Sim" : "Não",
      realce: ehRisco ? (v ? "err" : "ok") : undefined,
      peso: 2,
    };
  }

  // 4. Situacao / status com semantica de risco
  if (RE_SITUACAO.test(kn) && typeof v === "string") {
    const cor = corDaSituacao(v);
    return { label, valor: v, realce: cor ?? undefined, peso: 2 };
  }

  // 5. Monetario — inequivoco sempre; ambiguo so com casa decimal
  if (!RE_CONTAGEM.test(kn)) {
    const temDecimal =
      (typeof v === "number" && !Number.isInteger(v)) ||
      (typeof v === "string" && /[.,]\d{1,2}$/.test(v.trim()));
    if (RE_MONETARIO.test(kn) || (RE_MONETARIO_FRACO.test(kn) && temDecimal)) {
      const brl = formatarBRL(v);
      if (brl) return { label, valor: brl, peso: 3 };
    }
  }

  // 6. Data
  if (RE_DATA.test(kn) && pareceData(v)) {
    return { label, valor: formatarDataBR(String(v)), peso: 4 };
  }
  if (pareceData(v)) {
    return { label, valor: formatarDataBR(String(v)), peso: 4 };
  }

  // 7. Documento — mono, sem quebrar
  if (RE_DOC.test(kn)) {
    return { label, valor: String(v), peso: 0 };
  }

  return { label, valor: stringifyValue(v), peso: 5 };
}

/** Extrai campos formatados de um objeto (expande 1 nivel de aninhamento). */
function camposDoObjeto(obj: Record<string, unknown>): CampoFormatado[] {
  const out: CampoFormatado[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (isPlainObject(v)) {
      for (const [k2, v2] of Object.entries(v)) {
        if (isPlainObject(v2) || Array.isArray(v2)) continue;
        const c = formatarCampo(`${k} ${k2}`, v2);
        if (c) out.push(c);
      }
    } else if (!Array.isArray(v)) {
      const c = formatarCampo(k, v);
      if (c) out.push(c);
    }
  }
  // ordena por peso (identificacao -> situacao -> valores -> datas -> resto),
  // mantendo a ordem original dentro do mesmo peso
  return out.map((c, i) => ({ c, i })).sort((a, b) => a.c.peso - b.c.peso || a.i - b.i).map((x) => x.c);
}

/** Lista de campos ja formatados, com realce visual quando aplicavel. */
function CamposList({ campos }: { campos: CampoFormatado[] }) {
  return (
    <View>
      {campos.map((campo, i) => {
        const last = i === campos.length - 1;
        if (campo.realce === "barras") {
          return (
            <View key={`${campo.label}-${i}`} style={s.barrasBox}>
              <Text style={s.barrasLabel}>{campo.label.toUpperCase()}</Text>
              <Text style={s.barrasValor}>{campo.valor}</Text>
            </View>
          );
        }
        const corValor =
          campo.realce === "ok"
            ? c.ok
            : campo.realce === "err"
            ? c.err
            : campo.realce === "warn"
            ? c.warn
            : undefined;
        return (
          <View
            key={`${campo.label}-${i}`}
            style={[s.kvRow, ...(last ? [{ borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }] : [])]}
          >
            <Text style={s.kvKey}>{campo.label}</Text>
            <Text style={[s.kvValue, ...(corValor ? [{ color: corValor, fontFamily: "Helvetica-Bold" }] : [])]}>
              {campo.valor}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ---- FIPE ----
function renderFipe({ dados }: RenderArgs) {
  if (!isPlainObject(dados)) return renderGeneric({ dados });
  const data = dados as Record<string, unknown>;
  // APIFULL FIPE costuma vir com: Valor, Marca, Modelo, AnoModelo, Combustivel,
  // CodigoFipe, MesReferencia, TipoVeiculo
  const entries: Array<[string, string | null]> = [];
  const pick = (label: string, ...keys: string[]) => {
    for (const k of keys) {
      const v = data[k];
      if (v !== undefined && v !== null && v !== "") {
        entries.push([label, stringifyValue(v)]);
        return;
      }
    }
  };
  pick("Marca", "Marca", "marca");
  pick("Modelo", "Modelo", "modelo");
  pick("Ano modelo", "AnoModelo", "anoModelo", "ano_modelo", "ano");
  pick("Combustível", "Combustivel", "combustivel", "tipo_combustivel");
  pick("Código FIPE", "CodigoFipe", "codigo_fipe", "codigoFipe");
  pick("Valor FIPE", "Valor", "valor", "valor_fipe");
  pick("Mês referência", "MesReferencia", "mes_referencia");
  pick("Tipo veículo", "TipoVeiculo", "tipo_veiculo");
  if (entries.length === 0) return renderGeneric({ dados });
  return <KVList entries={entries} />;
}

// ---- Placa Basica ----
function renderPlacaBasica({ dados }: RenderArgs) {
  if (!isPlainObject(dados)) return renderGeneric({ dados });
  const data = dados as Record<string, unknown>;
  const entries: Array<[string, string | null]> = [];
  const pick = (label: string, ...keys: string[]) => {
    for (const k of keys) {
      const v = data[k];
      if (v !== undefined && v !== null && v !== "") {
        entries.push([label, stringifyValue(v)]);
        return;
      }
    }
  };
  pick("Marca", "MARCA", "Marca", "marca");
  pick("Modelo", "MODELO", "Modelo", "modelo");
  pick("Cor", "COR", "Cor", "cor");
  pick("Ano fabricação", "ANO_FABRICACAO", "ano_fabricacao", "AnoFabricacao");
  pick("Ano modelo", "ANO_MODELO", "ano_modelo", "AnoModelo");
  pick("Combustível", "COMBUSTIVEL", "Combustivel", "combustivel");
  pick("Chassi", "CHASSI", "Chassi", "chassi");
  pick("Município", "MUNICIPIO", "Municipio", "municipio", "cidade");
  pick("UF", "UF", "uf", "estado");
  pick("Categoria", "CATEGORIA", "categoria");
  if (entries.length === 0) return renderGeneric({ dados });
  return <KVList entries={entries} />;
}

// ---- BIN Nacional ----
function renderBinNacional({ dados }: RenderArgs) {
  if (!isPlainObject(dados)) return renderGeneric({ dados });
  // APIFULL aninha frequentemente em BIN_NACIONAL
  let payload: Record<string, unknown> = dados as Record<string, unknown>;
  if (isPlainObject(payload.BIN_NACIONAL)) payload = payload.BIN_NACIONAL as Record<string, unknown>;
  else if (isPlainObject(payload.bin_nacional)) payload = payload.bin_nacional as Record<string, unknown>;

  const entries: Array<[string, string | null]> = [];
  const pick = (label: string, ...keys: string[]) => {
    for (const k of keys) {
      const v = payload[k];
      if (v !== undefined && v !== null && v !== "") {
        entries.push([label, stringifyValue(v)]);
        return;
      }
    }
  };
  pick("Placa", "PLACA", "Placa", "placa");
  pick("Chassi", "CHASSI", "Chassi", "chassi");
  pick("UF", "UF", "uf");
  pick("Município", "MUNICIPIO", "Municipio", "municipio");
  pick("Marca / Modelo", "MARCA_MODELO", "marca_modelo");
  pick("Marca", "MARCA", "Marca", "marca");
  pick("Modelo", "MODELO", "Modelo", "modelo");
  pick("Cor", "COR", "Cor", "cor");
  pick("Ano fabricação", "ANO_FABRICACAO", "ano_fabricacao");
  pick("Ano modelo", "ANO_MODELO", "ano_modelo");
  pick("Combustível", "COMBUSTIVEL", "Combustivel", "combustivel");
  pick("Restrições", "RESTRICOES", "Restricoes", "restricoes", "RESTRICAO");
  pick("Categoria", "CATEGORIA", "categoria");
  pick("Espécie", "ESPECIE", "Especie", "especie");

  if (entries.length === 0) return renderGeneric({ dados: payload });
  return <KVList entries={entries} />;
}

// ---- Recall ----
function renderRecall({ dados }: RenderArgs) {
  if (!isPlainObject(dados)) return renderGeneric({ dados });
  const data = dados as Record<string, unknown>;
  // Comum: existe campo "recalls" array ou status boolean
  const recalls = (data.recalls ?? data.RECALLS ?? data.lista) as unknown;
  const possuiRecall =
    data.possui_recall ??
    data.tem_recall ??
    (Array.isArray(recalls) ? recalls.length > 0 : null);

  const entries: Array<[string, string | null]> = [];
  if (possuiRecall !== null && possuiRecall !== undefined) {
    entries.push(["Recall ativo", stringifyValue(possuiRecall)]);
  }
  if (Array.isArray(recalls) && recalls.length > 0) {
    entries.push(["Quantidade", String(recalls.length)]);
    // Adiciona ate 3 descricoes
    recalls.slice(0, 3).forEach((r, i) => {
      if (isPlainObject(r)) {
        const desc = (r.descricao ?? r.problema ?? r.assunto ?? r.titulo) as unknown;
        const campanha = (r.campanha ?? r.codigo) as unknown;
        if (desc) entries.push([`Recall ${i + 1}`, stringifyValue(desc)]);
        if (campanha) entries.push([`Campanha ${i + 1}`, stringifyValue(campanha)]);
      } else {
        entries.push([`Recall ${i + 1}`, stringifyValue(r)]);
      }
    });
  } else if (possuiRecall === false || possuiRecall === "false" || possuiRecall === "Não") {
    entries.push(["Status", "Nenhum recall ativo"]);
  }

  if (entries.length === 0) return renderGeneric({ dados });
  return <KVList entries={entries} />;
}

// ---- Gravame ----
function renderGravame({ dados }: RenderArgs) {
  if (!isPlainObject(dados)) return renderGeneric({ dados });
  const data = dados as Record<string, unknown>;
  const entries: Array<[string, string | null]> = [];
  const pick = (label: string, ...keys: string[]) => {
    for (const k of keys) {
      const v = data[k];
      if (v !== undefined && v !== null && v !== "") {
        entries.push([label, stringifyValue(v)]);
        return;
      }
    }
  };
  pick("Existe gravame", "possui_gravame", "tem_gravame", "EXISTE", "existe");
  pick("Tipo", "TIPO", "Tipo", "tipo", "tipo_gravame");
  pick("Data inclusão", "DATA_INCLUSAO", "data_inclusao");
  pick("Instituição financeira", "INSTITUICAO", "instituicao", "agente", "AGENTE");
  pick("UF", "UF", "uf");
  pick("Documento agente", "DOC_AGENTE", "doc_agente", "documento_agente");

  if (entries.length === 0) return renderGeneric({ dados });
  return <KVList entries={entries} />;
}

// ---- Leilao ----
function renderLeilao({ dados }: RenderArgs) {
  if (!isPlainObject(dados)) return renderGeneric({ dados });
  const data = dados as Record<string, unknown>;
  const entries: Array<[string, string | null]> = [];
  const pick = (label: string, ...keys: string[]) => {
    for (const k of keys) {
      const v = data[k];
      if (v !== undefined && v !== null && v !== "") {
        entries.push([label, stringifyValue(v)]);
        return;
      }
    }
  };
  pick("Tem registro de leilão", "TEM_REGISTRO", "tem_registro", "possui_leilao");
  pick("Leiloeiro", "LEILOEIRO", "Leiloeiro", "leiloeiro");
  pick("Data do leilão", "DATA", "data", "data_leilao");
  pick("Categoria sinistro", "CATEGORIA_SINISTRO", "categoria_sinistro", "MONTA", "monta");
  pick("Status atual", "STATUS", "Status", "status");
  pick("Cidade/UF", "CIDADE_UF", "cidade_uf", "local");

  if (entries.length === 0) return renderGeneric({ dados });
  return <KVList entries={entries} />;
}

// ---- Foto Leilao ----
function renderFotoLeilao({ dados }: RenderArgs) {
  if (!isPlainObject(dados) && !Array.isArray(dados)) return renderGeneric({ dados });
  const fotos = Array.isArray(dados)
    ? dados
    : ((dados as Record<string, unknown>).fotos ??
        (dados as Record<string, unknown>).imagens ??
        []);
  const arr = Array.isArray(fotos) ? fotos : [];
  const entries: Array<[string, string | null]> = [];
  entries.push(["Fotos disponíveis", String(arr.length)]);
  arr.slice(0, 5).forEach((f, i) => {
    if (typeof f === "string") entries.push([`Foto ${i + 1}`, f]);
    else if (isPlainObject(f)) {
      const url = (f.url ?? f.link ?? f.src) as unknown;
      if (url) entries.push([`Foto ${i + 1}`, stringifyValue(url)]);
    }
  });
  if (entries.length === 1 && arr.length === 0) {
    entries.push(["Status", "Nenhuma foto encontrada"]);
  }
  return <KVList entries={entries} />;
}

// ---- CSV / Certificado Segurança Veicular ----
function renderCsv({ dados }: RenderArgs) {
  // CSV vem como objeto agregador com varios sub-blocos
  if (!isPlainObject(dados)) return renderGeneric({ dados });
  const data = dados as Record<string, unknown>;
  const entries: Array<[string, string | null]> = [];

  // Coleta top-level scalars
  for (const [k, v] of Object.entries(data)) {
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean" ||
      v === null
    ) {
      entries.push([humanize(k), stringifyValue(v)]);
    }
  }
  // E sub-objetos com 1 nivel
  for (const [k, v] of Object.entries(data)) {
    if (isPlainObject(v)) {
      for (const [k2, v2] of Object.entries(v)) {
        if (
          typeof v2 === "string" ||
          typeof v2 === "number" ||
          typeof v2 === "boolean" ||
          v2 === null
        ) {
          entries.push([`${humanize(k)} · ${humanize(k2)}`, stringifyValue(v2)]);
        }
      }
    }
  }
  if (entries.length === 0) return renderGeneric({ dados });
  return <KVList entries={entries.slice(0, 25)} />;
}

// ---- Generic flat render (fallback) ----
function renderGeneric({ dados }: RenderArgs) {
  if (dados === null || dados === undefined) {
    return (
      <View style={s.emptyBox}>
        <Svg width={12} height={12} viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={10} fill={c.ok} opacity={0.2} />
          <Path d="M 7 12 L 11 16 L 17 8" stroke={c.ok} strokeWidth={2.5} fill="none" />
        </Svg>
        <Text style={s.emptyText}>Sem dados</Text>
      </View>
    );
  }

  if (Array.isArray(dados)) {
    if (dados.length === 0) {
      return (
        <View style={s.emptyBox}>
          <Text style={s.emptyText}>Nenhum registro encontrado</Text>
        </View>
      );
    }

    // Array de OBJETOS (multas, infracoes, restricoes, passagens...):
    // cada item vira um bloco com seus proprios campos. Sem isso cairia
    // em "Item 1: {json cru}", ilegivel justamente nas listas que mais
    // importam pro cliente.
    if (dados.some(isPlainObject)) {
      return (
        <View>
          {dados.slice(0, 15).map((item, i) => {
            if (!isPlainObject(item)) {
              return (
                <View key={i} style={s.kvRow}>
                  <Text style={s.kvKey}>{`${i + 1}`}</Text>
                  <Text style={s.kvValue}>{stringifyValue(item)}</Text>
                </View>
              );
            }
            const campos = camposDoObjeto(item);
            return (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={s.itemHeader}>{`Registro ${i + 1} de ${dados.length}`}</Text>
                <CamposList campos={campos.slice(0, 14)} />
              </View>
            );
          })}
          {dados.length > 15 ? (
            <Text style={s.emptyText}>
              {`+ ${dados.length - 15} registro(s) adicional(is) — ver dados completos no painel`}
            </Text>
          ) : null}
        </View>
      );
    }

    // Array de escalares
    return (
      <View>
        {dados.slice(0, 20).map((item, i) => (
          <View key={i} style={s.kvRow}>
            <Text style={s.kvKey}>{`${i + 1}`}</Text>
            <Text style={s.kvValue}>{stringifyValue(item)}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (isPlainObject(dados)) {
    // Heuristica por padrao: formata R$, datas, documentos, situacoes e
    // destaca codigo de barras — sem depender do nome exato do campo.
    const campos = camposDoObjeto(dados);

    // Listas aninhadas (multas[], processos[], socios[]...) viram blocos
    const listas = Object.entries(dados).filter(
      ([, v]) => Array.isArray(v) && v.length > 0
    ) as Array<[string, unknown[]]>;

    if (campos.length === 0 && listas.length === 0) {
      return (
        <View style={s.emptyBox}>
          <Text style={s.emptyText}>Nenhum dado retornado</Text>
        </View>
      );
    }

    return (
      <View>
        {campos.length > 0 ? <CamposList campos={campos.slice(0, 30)} /> : null}
        {listas.map(([nome, itens]) => (
          <View key={nome} style={{ marginTop: 10 }}>
            <Text style={s.itemHeader}>{`${humanize(nome)} · ${itens.length} registro(s)`}</Text>
            {renderGeneric({ dados: itens })}
          </View>
        ))}
      </View>
    );
  }

  // scalar
  return (
    <Text style={[s.kvValue, { paddingVertical: 6 }]}>{stringifyValue(dados)}</Text>
  );
}

// ============================================================
// Roteamento por API path
// ============================================================

export function renderApifullDados(apiPath: string, dados: unknown) {
  const key = apiPath.toLowerCase().trim();

  // Match prefixes — APIs com sufixo (ex "placa-basica-v2") caem aqui
  if (key === "fipe" || key.startsWith("fipe-")) return renderFipe({ dados });
  if (key === "placa-basica" || key.startsWith("placa-basica"))
    return renderPlacaBasica({ dados });
  if (key === "bin-nacional" || key.startsWith("bin-nacional"))
    return renderBinNacional({ dados });
  if (key === "bin-estadual" || key.startsWith("bin-estadual"))
    return renderBinNacional({ dados }); // mesma estrutura
  if (key === "recall" || key.startsWith("recall")) return renderRecall({ dados });
  if (key === "gravame" || key.startsWith("gravame")) return renderGravame({ dados });
  if (key === "leilao" || key.startsWith("leilao") || key.startsWith("leiloao"))
    return renderLeilao({ dados });
  if (key === "foto-leilao" || key.startsWith("foto-leilao"))
    return renderFotoLeilao({ dados });
  if (
    key === "certificado-seguranca-veicular" ||
    key.startsWith("certificado-seguranca") ||
    key === "csv"
  )
    return renderCsv({ dados });

  // Default — generic flat
  return renderGeneric({ dados });
}

// ============================================================
// Bloco principal — uma section APIFULL inteira
// ============================================================

interface ApifullSectionBlockProps {
  apiPath: string;
  section: ApifullSection;
}

export function ApifullSectionBlock({ apiPath, section }: ApifullSectionBlockProps) {
  const badge = statusBadge(section.status);
  const badgeStyle =
    badge.variant === "ok"
      ? s.sectionBadgeOk
      : badge.variant === "warn"
      ? s.sectionBadgeWarn
      : badge.variant === "err"
      ? s.sectionBadgeErr
      : badge.variant === "info"
      ? s.sectionBadgeInfo
      : s.sectionBadgeMuted;

  const showData = section.status === "sucesso" || section.status === "cached";

  return (
    <View style={s.section} wrap={false}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{section.nome || humanize(apiPath)}</Text>
        <Text style={[s.sectionBadge, badgeStyle]}>{badge.label}</Text>
      </View>
      <View style={s.sectionBody}>
        {showData ? (
          renderApifullDados(apiPath, section.dados)
        ) : section.status === "not_found" ? (
          <View style={s.emptyBox}>
            <Svg width={12} height={12} viewBox="0 0 24 24">
              <Circle cx={12} cy={12} r={10} fill={c.ok} opacity={0.2} />
              <Path d="M 7 12 L 11 16 L 17 8" stroke={c.ok} strokeWidth={2.5} fill="none" />
            </Svg>
            <Text style={s.emptyText}>Nenhum registro encontrado</Text>
          </View>
        ) : (
          <View style={s.unavailableBox}>
            <Text style={s.unavailableText}>
              Dado temporariamente indisponível
            </Text>
            {section.error && (
              <Text style={s.unavailableSub}>
                {section.error.length > 120
                  ? section.error.slice(0, 120) + "…"
                  : section.error}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// ============================================================
// Agrupamento por categoria
// ============================================================

/**
 * Ordena os api paths de um result_jsonb numa ordem visual estavel.
 * Identidade (placa/cpf-basico) primeiro, depois agregados (BIN), depois
 * verificacoes (recall, gravame), depois mercado (FIPE), depois leilao.
 */
const API_ORDER: string[] = [
  // identidade veicular
  "placa-basica",
  "bin-nacional",
  "bin-estadual",
  // verificacoes
  "recall",
  "gravame",
  "historico-roubo-furto",
  "historico-roubo-furto-premium",
  "proprietario-placa",
  "proprietario",
  // mercado
  "fipe",
  // pacotes oficiais
  "certificado-seguranca-veicular",
  "crlv",
  "vip-car",
  // leilao
  "leilao",
  "foto-leilao",
  // cpf
  "cpf-simples",
  "cpf-completo",
  "cpf-ultra-completo",
  "cpf-ultra-socios",
  "boa-vista-essencial",
  "serasa-basico",
  "serasa-premium",
  "cred-completa-plus",
  "cnd-trabalhista",
  "quod",
  "spc-brasil",
  "scr-bacen",
  "scr-bacen-socios",
  "busca-por-documentos",
  // cnpj
  "cnpj-completo",
];

export function sortedApiPaths(sections: Record<string, ApifullSection>): string[] {
  const keys = Object.keys(sections);
  const indexed = keys.map((k) => {
    const idx = API_ORDER.indexOf(k.toLowerCase());
    return { k, idx: idx === -1 ? 999 : idx };
  });
  indexed.sort((a, b) => a.idx - b.idx || a.k.localeCompare(b.k));
  return indexed.map((x) => x.k);
}
