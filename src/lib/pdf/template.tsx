/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Circle,
} from "@react-pdf/renderer";
import type { ConsultaResult, ResultSection } from "@/lib/consultas/mock-data";
import { findPlano, findComboLeilao } from "@/lib/consultas/planos";
import { CapivaraLogoPDF, CapivaraMonoPDF } from "./capivara-svg";
import {
  ApifullSectionBlock,
  isApifullResult,
  sortedApiPaths,
  type ApifullResult,
} from "./apifull-render";

// ============================================================
// Paleta Cerrado
// ============================================================
const c = {
  cocoa: "#1F1611",
  cocoa2: "#2C211A",
  fur: "#C46A3F",
  tabaco: "#8E4628",
  saffron: "#E8A547",
  sage: "#8B9778",
  cream: "#F4EAD8",
  paper: "#FBF6EC",
  paper2: "#FFFCF5",
  line: "#E6D8BD",
  ok: "#5E7C4F",
  warn: "#D78A1E",
  err: "#B23A2A",
  info: "#527090",
};

// ============================================================
// Stylesheet
// ============================================================
const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: c.cocoa,
    backgroundColor: c.paper,
  },

  // ---- CAPA ----
  coverPage: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    fontFamily: "Helvetica",
    backgroundColor: c.paper,
  },
  coverHeader: {
    backgroundColor: c.cocoa,
    paddingHorizontal: 50,
    paddingVertical: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  coverBody: {
    paddingHorizontal: 50,
    paddingTop: 40,
    paddingBottom: 30,
    flex: 1,
  },
  coverEyebrow: {
    fontSize: 9,
    color: c.tabaco,
    letterSpacing: 3,
    marginBottom: 10,
  },
  coverTitle: {
    fontSize: 38,
    fontFamily: "Helvetica-Bold",
    color: c.cocoa,
    letterSpacing: -1.5,
    lineHeight: 1.05,
  },
  coverTargetBox: {
    marginTop: 36,
    padding: 24,
    backgroundColor: c.paper2,
    borderLeftWidth: 4,
    borderLeftColor: c.fur,
  },
  coverTargetLabel: {
    fontSize: 8,
    color: c.tabaco,
    letterSpacing: 2,
    marginBottom: 8,
  },
  coverTargetValue: {
    fontSize: 30,
    fontFamily: "Courier-Bold",
    color: c.cocoa,
    letterSpacing: 1,
  },
  coverMeta: {
    marginTop: 28,
    flexDirection: "row",
    gap: 24,
  },
  coverMetaItem: { flex: 1 },
  coverMetaLabel: {
    fontSize: 7,
    color: c.tabaco,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  coverMetaValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: c.cocoa,
  },
  coverSummaryBox: {
    marginTop: 30,
    padding: 20,
    backgroundColor: c.cream,
    borderRadius: 6,
  },
  coverSummaryTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: c.cocoa,
    marginBottom: 10,
  },
  coverFooter: {
    backgroundColor: c.cocoa,
    paddingHorizontal: 50,
    paddingVertical: 16,
  },

  // ---- HEADER interno ----
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
  },
  headerBrand: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerBrandText: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: c.cocoa,
    letterSpacing: -0.3,
  },
  headerMeta: {
    fontSize: 7,
    color: c.tabaco,
    fontFamily: "Courier",
    textAlign: "right",
    letterSpacing: 0.5,
  },

  // ---- Seções ----
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
    color: c.tabaco,
    backgroundColor: c.paper,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  sectionBody: {
    padding: 14,
    paddingTop: 12,
  },

  // KV
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
  kvValueGood: { color: c.ok, fontFamily: "Helvetica-Bold" },
  kvValueWarn: { color: c.warn, fontFamily: "Helvetica-Bold" },
  kvValueErr: { color: c.err, fontFamily: "Helvetica-Bold" },

  // Score
  scoreBox: { flexDirection: "row", alignItems: "center", gap: 20 },
  scoreLeft: { width: 130 },
  scoreNumber: {
    fontSize: 40,
    fontFamily: "Helvetica-Bold",
    color: c.cocoa,
    letterSpacing: -1.5,
  },
  scoreOutOf: { fontSize: 11, color: c.tabaco },
  scoreClasse: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  scoreBureau: {
    fontSize: 8,
    color: c.tabaco,
    fontFamily: "Courier",
    marginTop: 6,
  },
  scoreRight: { flex: 1, paddingTop: 8 },
  scoreBarBg: {
    height: 10,
    backgroundColor: c.cream,
    borderRadius: 5,
  },
  scoreBarFill: { height: 10, borderRadius: 5 },
  scoreBarLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  scoreBarLabel: { fontSize: 6.5, color: c.tabaco, fontFamily: "Courier" },

  // Tabelas
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: c.cream,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 3,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: c.tabaco,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: c.line,
  },
  tableCell: { fontSize: 9, color: c.cocoa },
  tableCellMono: { fontSize: 8.5, color: c.cocoa, fontFamily: "Courier" },
  tableFooterRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1.5,
    borderTopColor: c.cocoa,
    marginTop: 4,
  },
  tableFooterCell: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.cocoa,
  },

  // Badge
  badge: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 10,
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
  badgeOk: { backgroundColor: c.ok },
  badgeWarn: { backgroundColor: c.warn },
  badgeErr: { backgroundColor: c.err },
  badgeInfo: { backgroundColor: c.info },
  badgeMuted: { backgroundColor: c.tabaco },

  // Empty
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

  // List items
  listItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: c.paper,
    borderRadius: 4,
    marginBottom: 6,
    borderLeftWidth: 2,
    borderLeftColor: c.line,
  },
  listItemMain: {
    fontSize: 9.5,
    color: c.cocoa,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  listItemSub: { fontSize: 8, color: c.tabaco, fontFamily: "Courier" },

  // Footer
  footer: {
    position: "absolute",
    bottom: 16,
    left: 40,
    right: 40,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: c.line,
  },
  footerDisclaimer: {
    fontSize: 6.5,
    color: c.tabaco,
    fontFamily: "Helvetica",
    lineHeight: 1.3,
    marginBottom: 4,
    fontStyle: "italic",
  },
  footerBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerText: {
    fontSize: 7,
    color: c.tabaco,
    fontFamily: "Courier",
    letterSpacing: 0.5,
  },
  pageNumber: { fontSize: 8, color: c.tabaco, fontFamily: "Courier-Bold" },

  // Disclaimer destacado na capa
  coverDisclaimer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#FFF7E6",
    borderLeftWidth: 3,
    borderLeftColor: c.saffron,
    borderRadius: 3,
  },
  coverDisclaimerTitle: {
    fontSize: 8,
    color: c.tabaco,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  coverDisclaimerText: {
    fontSize: 8,
    color: c.cocoa,
    fontFamily: "Helvetica",
    lineHeight: 1.45,
  },
});

// ============================================================
// Helpers
// ============================================================

function getStatusStyle(value: string | null) {
  if (!value) return null;
  const upper = value.toUpperCase().trim();
  if (
    ["ATIVA", "REGULAR", "NEGATIVA", "NADA CONSTA", "SEM GRAVAME", "PAGA", "QUITADA"].includes(upper)
  )
    return styles.kvValueGood;
  if (["EM ABERTO", "ATIVO", "SUSPENSA"].includes(upper)) return styles.kvValueWarn;
  return null;
}

const SCORE_CLASSE: Record<string, { label: string; color: string }> = {
  ALTO: { label: "Alto · Bom pagador", color: c.ok },
  MEDIO: { label: "Médio · Atenção", color: c.warn },
  BAIXO: { label: "Baixo · Risco alto", color: c.err },
  MUITO_BAIXO: { label: "Muito baixo · Crítico", color: c.err },
};

const VINCULOS: Record<string, string> = {
  mae: "Mãe",
  pai: "Pai",
  irmao: "Irmão(ã)",
  filho: "Filho(a)",
  conjuge: "Cônjuge",
};

function brl(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ============================================================
// Document
// ============================================================

interface RelatorioPDFProps {
  consultationId: string;
  /**
   * result_jsonb da consulta. Aceita dois formatos:
   *  - LEGADO (mock-data): { sections: ResultSection[] }
   *  - NOVO (APIFULL): { sections: Record<string, ApifullSection> }
   * O componente detecta via shape em runtime.
   */
  result: ConsultaResult | ApifullResult;
  targetValue: string;
  generatedAt: string;
  verificationUrl: string;
}

export function RelatorioPDF({
  consultationId,
  result,
  targetValue,
  generatedAt,
  verificationUrl,
}: RelatorioPDFProps) {
  const isApifull = isApifullResult(result);
  const planTier = result.plan_tier;
  // findPlano cobre cpf-*, cnpj-*, veicular-*. Pra leilao-*, usa findComboLeilao.
  const plano = findPlano(planTier) ?? findComboLeilao(planTier);
  const categoriaLabel =
    result.category === "cpf"
      ? "Consulta de CPF"
      : result.category === "cnpj"
      ? "Consulta de CNPJ"
      : "Consulta Veicular";

  const generatedDate = new Date(generatedAt);
  const dateStr = generatedDate.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Itens do sumario na capa
  const sumarioItems: Array<{ title: string; key: string }> = isApifull
    ? sortedApiPaths((result as ApifullResult).sections).map((k) => ({
        title: (result as ApifullResult).sections[k].nome || k,
        key: k,
      }))
    : (result as ConsultaResult).sections.map((sec, i) => ({
        title: sec.title,
        key: `legacy-${i}`,
      }));

  // Metadata do PDF: SEM PII (CPF/CNPJ/placa aparecem no title/subject
  // sao extraiveis via `pdfinfo`. Usar so identificador curto da consulta.)
  const shortId = consultationId ? consultationId.slice(-8).toUpperCase() : "";
  return (
    <Document
      author="Capivara"
      title={`Relatório Capivara #${shortId}`}
      subject={`Relatório de consulta ${categoriaLabel}`}
    >
      {/* CAPA */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <CapivaraLogoPDF width={56} pose="investigando" />
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Helvetica-Bold",
                  color: c.cream,
                  letterSpacing: -0.5,
                }}
              >
                capivara
              </Text>
              <Text
                style={{
                  fontSize: 7,
                  color: c.cream,
                  opacity: 0.7,
                  letterSpacing: 2,
                  marginTop: 2,
                }}
              >
                RELATÓRIO OFICIAL
              </Text>
            </View>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 7,
                color: c.cream,
                opacity: 0.6,
                letterSpacing: 1.5,
              }}
            >
              DOCUMENTO ID
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: c.saffron,
                fontFamily: "Courier-Bold",
                marginTop: 2,
                letterSpacing: 1,
              }}
            >
              {consultationId.slice(0, 8).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.coverBody}>
          <Text style={styles.coverEyebrow}>{categoriaLabel.toUpperCase()}</Text>
          <Text style={styles.coverTitle}>Capivara puxada</Text>
          <Text style={[styles.coverTitle, { color: c.fur }]}>com sucesso.</Text>

          <View style={styles.coverTargetBox}>
            <Text style={styles.coverTargetLabel}>
              {result.category === "cpf"
                ? "CPF CONSULTADO"
                : result.category === "cnpj"
                ? "CNPJ CONSULTADO"
                : "PLACA CONSULTADA"}
            </Text>
            <Text style={styles.coverTargetValue}>{targetValue}</Text>
          </View>

          <View style={styles.coverMeta}>
            <View style={styles.coverMetaItem}>
              <Text style={styles.coverMetaLabel}>PLANO CONTRATADO</Text>
              <Text style={styles.coverMetaValue}>{plano?.nome ?? "—"}</Text>
            </View>
            <View style={styles.coverMetaItem}>
              <Text style={styles.coverMetaLabel}>DATA E HORA</Text>
              <Text style={styles.coverMetaValue}>{dateStr}</Text>
            </View>
            <View style={styles.coverMetaItem}>
              <Text style={styles.coverMetaLabel}>VALIDADE</Text>
              <Text style={styles.coverMetaValue}>90 dias</Text>
            </View>
          </View>

          <View style={styles.coverSummaryBox}>
            <Text style={styles.coverSummaryTitle}>O que está neste relatório</Text>
            {sumarioItems.map((item, i) => (
              <View key={item.key} style={{ flexDirection: "row", paddingVertical: 3 }}>
                <View
                  style={{
                    width: 5,
                    height: 5,
                    backgroundColor: c.fur,
                    marginTop: 5,
                    marginRight: 8,
                    borderRadius: 2.5,
                  }}
                />
                <Text style={{ fontSize: 9, color: c.cocoa, flex: 1 }}>{item.title}</Text>
                <Text
                  style={{
                    fontSize: 7,
                    color: c.tabaco,
                    fontFamily: "Courier",
                  }}
                >
                  pág. {i + 2}
                </Text>
              </View>
            ))}
          </View>

          {/* DISCLAIMER DE INTERMEDIACAO TECNICA */}
          <View style={styles.coverDisclaimer}>
            <Text style={styles.coverDisclaimerTitle}>
              ⚠ AVISO IMPORTANTE — LEIA ANTES DE USAR
            </Text>
            <Text style={styles.coverDisclaimerText}>
              Este relatório foi gerado em{" "}
              <Text style={{ fontFamily: "Helvetica-Bold" }}>{dateStr}</Text>
              {" "}por intermediação técnica. A Capivara agrega informações de
              fontes externas (Receita Federal, Detran, Serasa, Boa Vista, SPC,
              SCR Bacen, cartórios, bureaus privados) e{" "}
              <Text style={{ fontFamily: "Helvetica-Bold" }}>
                não garante a atualidade, exatidão ou completude dos dados
              </Text>
              .
              {"\n\n"}
              Os dados podem ter sido atualizados nas fontes APÓS esta consulta.
              Multas, sinistros, débitos, restrições, alterações cadastrais e
              outros eventos posteriores não estarão refletidos neste relatório.
              Em caso de divergência com a fonte oficial, prevalece a fonte
              oficial.
              {"\n\n"}
              Para uso oficial (compra/venda formal, processo judicial),
              recomendamos confirmar diretamente no órgão emissor (Detran,
              Receita Federal, cartório) na data da decisão.
            </Text>
          </View>
        </View>

        <View style={styles.coverFooter}>
          <Text
            style={{
              fontSize: 7.5,
              color: c.cream,
              opacity: 0.7,
              letterSpacing: 1,
            }}
          >
            Documento gerado pela CAPIVARA · Verificar autenticidade em{" "}
            <Text style={{ color: c.saffron }}>{verificationUrl}</Text>
          </Text>
        </View>
      </Page>

      {/* PÁGINAS DAS SEÇÕES */}
      <Page size="A4" style={styles.page}>
        <PageHeader consultationId={consultationId} dateStr={dateStr} />
        {isApifull
          ? sortedApiPaths((result as ApifullResult).sections).map((apiPath) => (
              <ApifullSectionBlock
                key={apiPath}
                apiPath={apiPath}
                section={(result as ApifullResult).sections[apiPath]}
              />
            ))
          : (result as ConsultaResult).sections.map((section, i) => (
              <SectionBlock key={i} section={section} />
            ))}
        <Footer verificationUrl={verificationUrl} />
      </Page>
    </Document>
  );
}

// ============================================================
// PageHeader
// ============================================================

function PageHeader({
  consultationId,
  dateStr,
}: {
  consultationId: string;
  dateStr: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerBrand}>
        <CapivaraMonoPDF width={26} color={c.fur} />
        <Text style={styles.headerBrandText}>capivara</Text>
      </View>
      <Text style={styles.headerMeta}>
        {consultationId.slice(0, 8).toUpperCase()} · {dateStr}
      </Text>
    </View>
  );
}

// ============================================================
// Footer
// ============================================================

function Footer({ verificationUrl }: { verificationUrl: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerDisclaimer}>
        Relatório gerado por intermediação técnica. A Capivara agrega dados de fontes externas
        (Receita Federal, Detran, bureaus de crédito, cartórios) e não garante a atualidade,
        exatidão ou completude. Dados podem ter sido atualizados nas fontes após esta consulta.
        Em divergência, prevalece a fonte primária. Não substitui consulta presencial em órgão oficial.
      </Text>
      <View style={styles.footerBottomRow}>
        <View style={styles.footerLeft}>
          <CapivaraMonoPDF width={14} color={c.tabaco} />
          <Text style={styles.footerText}>
            suacapivara.com.br · Verificar: {verificationUrl}
          </Text>
        </View>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      </View>
    </View>
  );
}

// ============================================================
// SectionBlock
// ============================================================

function SectionBlock({ section }: { section: ResultSection }) {
  const itemCount = countItems(section);
  return (
    <View style={styles.section} wrap={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {itemCount !== null && (
          <Text style={styles.sectionBadge}>
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </Text>
        )}
      </View>
      <View style={styles.sectionBody}>{renderBody(section)}</View>
    </View>
  );
}

function countItems(section: ResultSection): number | null {
  if (section.type === "list" || section.type === "table") {
    return (section.items as unknown[])?.length ?? 0;
  }
  return null;
}

function renderBody(section: ResultSection) {
  if (section.type === "kv") return <KVList data={section.data} />;
  if (section.type === "score") return <ScoreCard section={section} />;
  if (section.type === "list" || section.type === "table") {
    const items = (section.items as unknown[]) ?? [];
    if (items.length === 0) {
      return (
        <View style={styles.emptyBox}>
          <Svg width={12} height={12} viewBox="0 0 24 24">
            <Circle cx={12} cy={12} r={10} fill={c.ok} opacity={0.2} />
            <Path
              d="M 7 12 L 11 16 L 17 8"
              stroke={c.ok}
              strokeWidth={2.5}
              fill="none"
            />
          </Svg>
          <Text style={styles.emptyText}>Nenhum registro encontrado</Text>
        </View>
      );
    }
    return <ItemsRenderer section={section} />;
  }
  return null;
}

// ============================================================
// KVList
// ============================================================

function KVList({ data }: { data: Record<string, string | null> }) {
  const entries = Object.entries(data);
  return (
    <View>
      {entries.map(([k, v], i) => {
        const status = getStatusStyle(v);
        const last = i === entries.length - 1;
        return (
          <View
            key={k}
            style={[
              styles.kvRow,
              ...(last ? [{ borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }] : []),
            ]}
          >
            <Text style={styles.kvKey}>{k}</Text>
            <Text style={[styles.kvValue, ...(status ? [status] : [])]}>
              {v ?? "—"}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ============================================================
// ScoreCard
// ============================================================

function ScoreCard({
  section,
}: {
  section: Extract<ResultSection, { type: "score" }>;
}) {
  const percent = (section.valor / section.max) * 100;
  const cls = SCORE_CLASSE[section.classe];
  return (
    <View style={styles.scoreBox}>
      <View style={styles.scoreLeft}>
        <Text style={styles.scoreNumber}>{section.valor}</Text>
        <Text style={styles.scoreOutOf}>de {section.max}</Text>
        <Text style={[styles.scoreClasse, { color: cls.color }]}>{cls.label}</Text>
        <Text style={styles.scoreBureau}>{section.bureau}</Text>
      </View>
      <View style={styles.scoreRight}>
        <View style={styles.scoreBarBg}>
          <View
            style={[
              styles.scoreBarFill,
              { width: `${percent}%`, backgroundColor: cls.color },
            ]}
          />
        </View>
        <View style={styles.scoreBarLabels}>
          <Text style={styles.scoreBarLabel}>0</Text>
          <Text style={styles.scoreBarLabel}>{Math.floor(section.max / 2)}</Text>
          <Text style={styles.scoreBarLabel}>{section.max}</Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================
// ItemsRenderer
// ============================================================

function Badge({
  label,
  variant,
}: {
  label: string;
  variant: "ok" | "warn" | "err" | "info" | "muted";
}) {
  const variantStyle =
    variant === "ok"
      ? styles.badgeOk
      : variant === "warn"
      ? styles.badgeWarn
      : variant === "err"
      ? styles.badgeErr
      : variant === "info"
      ? styles.badgeInfo
      : styles.badgeMuted;
  return <Text style={[styles.badge, variantStyle]}>{label}</Text>;
}

function ItemsRenderer({ section }: { section: ResultSection }) {
  if (section.type !== "list" && section.type !== "table") return null;
  const items = section.items as unknown[];

  switch (section.id) {
    case "enderecos":
      return (
        <View>
          {(items as Array<Record<string, unknown>>).map((e, i) => (
            <View key={i} style={styles.listItem}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 3,
                }}
              >
                <Badge
                  label={e.tipo === "atual" ? "ATUAL" : "ANTERIOR"}
                  variant={e.tipo === "atual" ? "ok" : "muted"}
                />
                <Text style={styles.listItemMain}>
                  {String(e.logradouro)}, {String(e.numero)}
                </Text>
              </View>
              <Text style={styles.listItemSub}>
                {String(e.bairro)} · {String(e.cidade)}/{String(e.uf)} · CEP {String(e.cep)}
              </Text>
            </View>
          ))}
        </View>
      );

    case "telefones":
      return (
        <View>
          {(items as Array<Record<string, unknown>>).map((t, i) => (
            <View
              key={i}
              style={[
                styles.listItem,
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              ]}
            >
              <Text style={[styles.listItemMain, { fontFamily: "Courier-Bold" }]}>
                {String(t.numero)}
              </Text>
              <Text style={styles.listItemSub}>
                {t.tipo === "celular" ? "Celular" : "Fixo"} · desde {String(t.cadastro).slice(0, 4)}
              </Text>
            </View>
          ))}
        </View>
      );

    case "emails":
      return (
        <View>
          {(items as string[]).map((e, i) => (
            <Text
              key={i}
              style={[styles.listItemMain, { fontFamily: "Courier", fontSize: 9, paddingVertical: 3 }]}
            >
              {e}
            </Text>
          ))}
        </View>
      );

    case "parentes":
      return (
        <View>
          {(items as Array<Record<string, unknown>>).map((p, i) => (
            <View
              key={i}
              style={[
                styles.listItem,
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              ]}
            >
              <Text style={styles.listItemMain}>{String(p.nome)}</Text>
              <Badge
                label={VINCULOS[p.vinculo as string] ?? String(p.vinculo)}
                variant="info"
              />
            </View>
          ))}
        </View>
      );

    case "empresas":
      return (
        <View>
          {(items as Array<Record<string, unknown>>).map((e, i) => (
            <View key={i} style={styles.listItem}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={styles.listItemMain}>{String(e.razao_social)}</Text>
                <Badge
                  label={String(e.situacao)}
                  variant={e.situacao === "ATIVA" ? "ok" : "muted"}
                />
              </View>
              <Text style={styles.listItemSub}>
                CNPJ {String(e.cnpj)} · {String(e.qualificacao)} desde{" "}
                {new Date(String(e.data_entrada)).toLocaleDateString("pt-BR")}
              </Text>
            </View>
          ))}
        </View>
      );

    case "empresa_socios":
      return (
        <View>
          {(items as Array<Record<string, unknown>>).map((s, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.listItemMain}>{String(s.nome)}</Text>
              <Text style={styles.listItemSub}>
                CPF {String(s.cpf_mascarado)} · {String(s.qualificacao)} desde{" "}
                {new Date(String(s.data_entrada)).toLocaleDateString("pt-BR")}
              </Text>
            </View>
          ))}
        </View>
      );

    case "dividas": {
      const arr = items as Array<{
        credor: string;
        valor_centavos: number;
        data_origem: string;
        status: string;
      }>;
      const total = arr.reduce((s, d) => s + d.valor_centavos, 0);
      return (
        <View>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>CREDOR</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>ORIGEM</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>
              VALOR
            </Text>
            <Text style={[styles.tableHeaderCell, { width: 70, textAlign: "right" }]}>
              STATUS
            </Text>
          </View>
          {arr.map((d, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{d.credor}</Text>
              <Text style={[styles.tableCellMono, { flex: 1 }]}>
                {new Date(d.data_origem).toLocaleDateString("pt-BR")}
              </Text>
              <Text style={[styles.tableCellMono, { flex: 1, textAlign: "right" }]}>
                {brl(d.valor_centavos)}
              </Text>
              <View style={{ width: 70, alignItems: "flex-end" }}>
                <Badge
                  label={d.status === "EM_ABERTO" ? "EM ABERTO" : "QUITADA"}
                  variant={d.status === "EM_ABERTO" ? "warn" : "ok"}
                />
              </View>
            </View>
          ))}
          <View style={styles.tableFooterRow}>
            <Text style={[styles.tableFooterCell, { flex: 3 }]}>Total em aberto</Text>
            <Text style={[styles.tableFooterCell, { flex: 1, textAlign: "right" }]}>
              {brl(total)}
            </Text>
            <View style={{ width: 70 }} />
          </View>
        </View>
      );
    }

    case "scr_bacen": {
      const arr = items as Array<{
        instituicao: string;
        modalidade: string;
        saldo_centavos: number;
      }>;
      const total = arr.reduce((s, o) => s + o.saldo_centavos, 0);
      return (
        <View>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>INSTITUIÇÃO</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>MODALIDADE</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>
              SALDO
            </Text>
          </View>
          {arr.map((o, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{o.instituicao}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{o.modalidade}</Text>
              <Text style={[styles.tableCellMono, { flex: 1, textAlign: "right" }]}>
                {brl(o.saldo_centavos)}
              </Text>
            </View>
          ))}
          <View style={styles.tableFooterRow}>
            <Text style={[styles.tableFooterCell, { flex: 4 }]}>
              Comprometimento total
            </Text>
            <Text style={[styles.tableFooterCell, { flex: 1, textAlign: "right" }]}>
              {brl(total)}
            </Text>
          </View>
        </View>
      );
    }

    case "veiculo_multas": {
      const arr = items as Array<{
        descricao: string;
        data: string;
        local: string;
        valor_centavos: number;
        pontos: number;
        status: string;
      }>;
      const total = arr.reduce((s, m) => s + m.valor_centavos, 0);
      return (
        <View>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, { flex: 3 }]}>DESCRIÇÃO</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "center" }]}>
              PONTOS
            </Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>
              VALOR
            </Text>
            <Text style={[styles.tableHeaderCell, { width: 60, textAlign: "right" }]}>
              STATUS
            </Text>
          </View>
          {arr.map((m, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={{ flex: 3 }}>
                <Text style={styles.tableCell}>{m.descricao}</Text>
                <Text style={[styles.listItemSub, { marginTop: 2 }]}>
                  {m.local} · {new Date(m.data).toLocaleDateString("pt-BR")}
                </Text>
              </View>
              <Text style={[styles.tableCellMono, { flex: 1, textAlign: "center" }]}>
                {m.pontos}
              </Text>
              <Text style={[styles.tableCellMono, { flex: 1, textAlign: "right" }]}>
                {brl(m.valor_centavos)}
              </Text>
              <View style={{ width: 60, alignItems: "flex-end" }}>
                <Badge label={m.status} variant={m.status === "PAGA" ? "ok" : "warn"} />
              </View>
            </View>
          ))}
          <View style={styles.tableFooterRow}>
            <Text style={[styles.tableFooterCell, { flex: 4 }]}>Total</Text>
            <Text style={[styles.tableFooterCell, { flex: 1, textAlign: "right" }]}>
              {brl(total)}
            </Text>
            <View style={{ width: 60 }} />
          </View>
        </View>
      );
    }

    case "protestos": {
      const arr = items as Array<{
        cartorio: string;
        cidade_uf: string;
        valor_centavos: number;
        data_protesto: string;
        status: string;
      }>;
      return (
        <View>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>CARTÓRIO</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>CIDADE</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>VALOR</Text>
            <Text style={[styles.tableHeaderCell, { width: 70, textAlign: "right" }]}>STATUS</Text>
          </View>
          {arr.map((p, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{p.cartorio}</Text>
              <Text style={[styles.tableCellMono, { flex: 1 }]}>{p.cidade_uf}</Text>
              <Text style={[styles.tableCellMono, { flex: 1, textAlign: "right" }]}>
                {brl(p.valor_centavos)}
              </Text>
              <View style={{ width: 70, alignItems: "flex-end" }}>
                <Badge
                  label={p.status}
                  variant={p.status === "ATIVO" ? "warn" : "ok"}
                />
              </View>
            </View>
          ))}
        </View>
      );
    }

    case "cheques": {
      const arr = items as Array<{
        banco: string;
        data: string;
        motivo: string;
      }>;
      return (
        <View>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>BANCO</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>DATA</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>MOTIVO</Text>
          </View>
          {arr.map((ch, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{ch.banco}</Text>
              <Text style={[styles.tableCellMono, { flex: 1 }]}>
                {new Date(ch.data).toLocaleDateString("pt-BR")}
              </Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{ch.motivo}</Text>
            </View>
          ))}
        </View>
      );
    }

    case "veiculo_recall": {
      const arr = items as Array<{
        campanha: string;
        fabricante: string;
        problema: string;
        status: string;
      }>;
      return (
        <View>
          {arr.map((r, i) => (
            <View
              key={i}
              style={[
                styles.listItem,
                { borderLeftColor: r.status === "ATIVO" ? c.warn : c.ok, borderLeftWidth: 3 },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={styles.listItemMain}>{r.campanha}</Text>
                <Badge
                  label={r.status}
                  variant={r.status === "ATIVO" ? "warn" : "ok"}
                />
              </View>
              <Text style={styles.listItemSub}>
                {r.fabricante} · {r.problema}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    case "veiculo_leilao": {
      const arr = items as Array<{
        leiloeiro: string;
        data: string;
        motivo: string;
        cidade_uf: string;
      }>;
      return (
        <View>
          {arr.map((l, i) => (
            <View
              key={i}
              style={[
                styles.listItem,
                { borderLeftColor: c.warn, borderLeftWidth: 3 },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={styles.listItemMain}>{l.motivo}</Text>
                <Badge label="LEILÃO" variant="warn" />
              </View>
              <Text style={styles.listItemSub}>
                {l.leiloeiro} · {l.cidade_uf} ·{" "}
                {new Date(l.data).toLocaleDateString("pt-BR")}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    default:
      return (
        <View>
          {(items as Array<Record<string, unknown> | string>).map((it, i) => (
            <Text key={i} style={[styles.tableCell, { paddingVertical: 3 }]}>
              {typeof it === "string"
                ? it
                : Object.values(it).join(" · ")}
            </Text>
          ))}
        </View>
      );
  }
}
