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
    return (
      <View>
        {dados.slice(0, 10).map((item, i) => (
          <View key={i} style={s.kvRow}>
            <Text style={s.kvKey}>{`Item ${i + 1}`}</Text>
            <Text style={s.kvValue}>{stringifyValue(item)}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (isPlainObject(dados)) {
    const entries: Array<[string, string | null]> = [];
    for (const [k, v] of Object.entries(dados)) {
      // Profundidade 2: se for objeto, expande 1 nivel
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
      } else {
        entries.push([humanize(k), stringifyValue(v)]);
      }
    }
    if (entries.length === 0) {
      return (
        <View style={s.emptyBox}>
          <Text style={s.emptyText}>Nenhum dado retornado</Text>
        </View>
      );
    }
    return <KVList entries={entries.slice(0, 30)} />;
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
