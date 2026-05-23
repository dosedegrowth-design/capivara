/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Rect,
} from "@react-pdf/renderer";
import type { ProdutoAvulso } from "@/lib/consultas/planos";
import { CapivaraLogoPDF, CapivaraMonoPDF } from "./capivara-svg";

// ============================================================
// Paleta Cerrado (mesma do template principal)
// ============================================================
const c = {
  cocoa: "#1F1611",
  cocoa2: "#2C211A",
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
};

// ============================================================
// Stylesheet (compacto, 1 pagina)
// ============================================================
const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: c.cocoa,
    backgroundColor: c.paper,
  },

  // Header
  header: {
    backgroundColor: c.cocoa,
    paddingHorizontal: 36,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerBrand: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerBrandText: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: c.cream,
    letterSpacing: -0.3,
  },
  headerBrandEyebrow: {
    fontSize: 6.5,
    color: c.cream,
    opacity: 0.7,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  headerRight: { alignItems: "flex-end" },
  headerIdLabel: {
    fontSize: 6.5,
    color: c.cream,
    opacity: 0.6,
    letterSpacing: 1.2,
  },
  headerIdValue: {
    fontSize: 10,
    color: c.saffron,
    fontFamily: "Courier-Bold",
    letterSpacing: 1,
    marginTop: 2,
  },

  // Hero
  hero: {
    paddingHorizontal: 36,
    paddingTop: 22,
    paddingBottom: 12,
  },
  heroEyebrow: {
    fontSize: 8,
    color: c.tabaco,
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: c.cocoa,
    letterSpacing: -0.8,
    lineHeight: 1.1,
  },
  heroSubtitle: {
    fontSize: 9.5,
    color: c.tabaco,
    marginTop: 6,
    lineHeight: 1.4,
  },

  // Target box
  targetBox: {
    marginHorizontal: 36,
    marginTop: 12,
    padding: 14,
    backgroundColor: c.paper2,
    borderLeftWidth: 3,
    borderLeftColor: c.fur,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  targetLabel: {
    fontSize: 7,
    color: c.tabaco,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  targetValue: {
    fontSize: 18,
    fontFamily: "Courier-Bold",
    color: c.cocoa,
    letterSpacing: 0.6,
  },
  targetMeta: { alignItems: "flex-end" },
  targetMetaLabel: {
    fontSize: 6.5,
    color: c.tabaco,
    letterSpacing: 1.2,
  },
  targetMetaValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: c.cocoa,
    marginTop: 2,
  },

  // Sections
  sectionsWrap: {
    paddingHorizontal: 36,
    paddingTop: 16,
  },
  section: {
    marginBottom: 12,
    borderRadius: 5,
    backgroundColor: c.paper2,
    borderLeftWidth: 3,
    borderLeftColor: c.fur,
    overflow: "hidden",
  },
  sectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: c.cream,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.cocoa,
  },
  sectionBody: { padding: 12 },

  kvRow: {
    flexDirection: "row",
    marginBottom: 5,
    paddingBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: c.line,
  },
  kvKey: {
    width: "42%",
    fontSize: 8,
    letterSpacing: 0.5,
    color: c.tabaco,
    paddingRight: 8,
  },
  kvValue: { width: "58%", fontSize: 10, color: c.cocoa },

  // About box
  aboutBox: {
    marginHorizontal: 36,
    marginTop: 10,
    padding: 14,
    backgroundColor: c.cream,
    borderRadius: 5,
  },
  aboutTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: c.cocoa,
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  aboutText: {
    fontSize: 9,
    color: c.cocoa,
    lineHeight: 1.4,
  },
  aboutLabel: {
    fontSize: 7,
    color: c.tabaco,
    letterSpacing: 1.2,
    marginTop: 8,
    marginBottom: 3,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: c.cocoa,
    paddingHorizontal: 36,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: { flex: 1, paddingRight: 20 },
  footerText: {
    fontSize: 7,
    color: c.cream,
    opacity: 0.75,
    fontFamily: "Courier",
    letterSpacing: 0.4,
    lineHeight: 1.4,
  },
  footerUrl: {
    color: c.saffron,
    fontFamily: "Courier-Bold",
  },

  // QR
  qrWrap: {
    backgroundColor: c.cream,
    padding: 5,
    borderRadius: 3,
  },
});

// ============================================================
// Tipos publicos
// ============================================================

export interface DadoSecao {
  /** Titulo da secao (ex: "Dados do veiculo", "FIPE"). */
  titulo: string;
  /** Pares chave/valor da secao. Valores null aparecem como "—". */
  itens: { label: string; valor: string | null }[];
}

interface RelatorioAvulsoPDFProps {
  produto: ProdutoAvulso;
  /** Dados retornados pela API estruturados em N secoes. */
  dados: DadoSecao[];
  consultationId: string;
  /** Valor consultado (placa, cpf, cnpj). */
  targetValue: string;
  generatedAt: string;
  verificationUrl: string;
}

// ============================================================
// Componente principal
// ============================================================

export function RelatorioAvulsoPDF({
  produto,
  dados,
  consultationId,
  targetValue,
  generatedAt,
  verificationUrl,
}: RelatorioAvulsoPDFProps) {
  const generatedDate = new Date(generatedAt);
  const dateStr = generatedDate.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const shortId = consultationId.slice(0, 8).toUpperCase();
  const targetLabel = inferTargetLabel(produto, targetValue);

  return (
    <Document
      author="Capivara"
      title={`${produto.nome} · ${targetValue}`}
      subject={`Consulta avulsa: ${produto.nome}`}
    >
      <Page size="A4" style={styles.page}>
        {/* ---------- Header ---------- */}
        <View style={styles.header}>
          <View style={styles.headerBrand}>
            <CapivaraLogoPDF width={42} pose="investigando" />
            <View>
              <Text style={styles.headerBrandText}>capivara</Text>
              <Text style={styles.headerBrandEyebrow}>RELATÓRIO PONTUAL</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerIdLabel}>DOCUMENTO ID</Text>
            <Text style={styles.headerIdValue}>{shortId}</Text>
          </View>
        </View>

        {/* ---------- Hero ---------- */}
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>
            CONSULTA AVULSA · {produto.categoria.toUpperCase()}
          </Text>
          <Text style={styles.heroTitle}>{produto.nome}</Text>
          <Text style={styles.heroSubtitle}>{produto.descricao}</Text>
        </View>

        {/* ---------- Target box ---------- */}
        <View style={styles.targetBox}>
          <View>
            <Text style={styles.targetLabel}>{targetLabel}</Text>
            <Text style={styles.targetValue}>{targetValue}</Text>
          </View>
          <View style={styles.targetMeta}>
            <Text style={styles.targetMetaLabel}>EMITIDO EM</Text>
            <Text style={styles.targetMetaValue}>{dateStr}</Text>
          </View>
        </View>

        {/* ---------- Secoes de dados ---------- */}
        <View style={styles.sectionsWrap}>
          {dados.map((secao, i) => (
            <View key={i} style={styles.section} wrap={false}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{secao.titulo}</Text>
              </View>
              <View style={styles.sectionBody}>
                {secao.itens.map((item, j) => {
                  const last = j === secao.itens.length - 1;
                  return (
                    <View
                      key={j}
                      style={[
                        styles.kvRow,
                        ...(last
                          ? [
                              {
                                borderBottomWidth: 0,
                                marginBottom: 0,
                                paddingBottom: 0,
                              },
                            ]
                          : []),
                      ]}
                    >
                      <Text style={styles.kvKey}>{item.label}</Text>
                      <Text style={styles.kvValue}>{item.valor ?? "—"}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* ---------- Sobre essa consulta ---------- */}
        <View style={styles.aboutBox}>
          <Text style={styles.aboutTitle}>Sobre essa consulta</Text>
          <Text style={styles.aboutText}>{produto.descricao}</Text>

          <Text style={styles.aboutLabel}>PRA QUEM</Text>
          <Text style={styles.aboutText}>{produto.publicoAlvo}</Text>
        </View>

        {/* ---------- Footer com QR ---------- */}
        <View style={styles.footer} fixed>
          <View style={styles.footerLeft}>
            <Text style={styles.footerText}>
              Documento gerado por intermediação técnica. Verificar autenticidade em{" "}
              <Text style={styles.footerUrl}>{verificationUrl}</Text>
              {"\n"}
              ID curto:{" "}
              <Text style={{ color: c.saffron, fontFamily: "Courier-Bold" }}>
                {shortId}
              </Text>
              {"  ·  suacapivara.com.br"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
              <CapivaraMonoPDF width={10} color={c.cream} />
              <Text style={[styles.footerText, { opacity: 0.6 }]}>
                Capivara · 2026
              </Text>
            </View>
          </View>
          <View style={styles.qrWrap}>
            <QRPlaceholder value={verificationUrl} size={48} />
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ============================================================
// QR "placeholder" — desenho geometrico determinístico
// (renderização real de QR no Capivara fica num servico
// upstream que injeta a imagem; aqui geramos um codigo visual
// estável a partir do hash do valor.)
// ============================================================

function QRPlaceholder({ value, size = 48 }: { value: string; size?: number }) {
  // Hash determinístico simples (djb2)
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }

  const cells = 9;
  const cellSize = size / cells;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Rect width={size} height={size} fill={c.paper2} />
      {/* Cantos fixos tipo finder pattern */}
      {[
        [0, 0],
        [cells - 3, 0],
        [0, cells - 3],
      ].map(([cx, cy], i) => (
        <Rect
          key={`finder-${i}`}
          x={cx * cellSize + 1}
          y={cy * cellSize + 1}
          width={cellSize * 3 - 2}
          height={cellSize * 3 - 2}
          fill={c.cocoa}
        />
      ))}
      {[
        [1, 1],
        [cells - 2, 1],
        [1, cells - 2],
      ].map(([cx, cy], i) => (
        <Rect
          key={`finder-inner-${i}`}
          x={cx * cellSize + 1}
          y={cy * cellSize + 1}
          width={cellSize - 2}
          height={cellSize - 2}
          fill={c.paper2}
        />
      ))}
      {/* Cells deterministicas pelo hash */}
      {Array.from({ length: cells }).flatMap((_, x) =>
        Array.from({ length: cells }).map((_, y) => {
          // pula os finder
          if ((x < 3 && y < 3) || (x >= cells - 3 && y < 3) || (x < 3 && y >= cells - 3)) {
            return null;
          }
          const bit = ((hash >> ((x * cells + y) % 30)) ^ (x * 7 + y * 13)) & 1;
          if (!bit) return null;
          return (
            <Rect
              key={`c-${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize - 0.5}
              height={cellSize - 0.5}
              fill={c.cocoa}
            />
          );
        })
      )}
      {/* Caminho do logo central (capivarinha) */}
      <Path
        d={`M ${size / 2 - 4} ${size / 2 - 4} h 8 v 8 h -8 z`}
        fill={c.fur}
      />
    </Svg>
  );
}

// ============================================================
// Helpers
// ============================================================

function inferTargetLabel(produto: ProdutoAvulso, targetValue: string): string {
  // Veicular ou leilao = placa
  if (produto.categoria === "veicular" || produto.categoria === "leilao") {
    return "PLACA CONSULTADA";
  }
  // Caso futuro: distinguir CPF/CNPJ por tamanho
  const onlyDigits = targetValue.replace(/\D/g, "");
  if (onlyDigits.length === 11) return "CPF CONSULTADO";
  if (onlyDigits.length === 14) return "CNPJ CONSULTADO";
  return "DOCUMENTO CONSULTADO";
}
