/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import type { ConsultaResult, ResultSection } from "@/lib/consultas/mock-data";
import { findPlano } from "@/lib/consultas/planos";

// ============================================================
// Fontes (Google Fonts CDN — react-pdf carrega no momento do render)
// ============================================================

Font.register({
  family: "Bricolage Grotesque",
  fonts: [
    { src: "https://fonts.gstatic.com/s/bricolagegrotesque/v8/3y9U6as8bTXq_nANBjzKo3IeZx8z6up5BeSl5jBNz_19PpbpMXuECpwUxJBOm_OJWiaaD30YfKfjZZoLvRviyM0nTYjLrwou.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/bricolagegrotesque/v8/3y9U6as8bTXq_nANBjzKo3IeZx8z6up5BeSl5jBNz_19PpbpMXuECpwUxJBOm_OJWiaaD30YfKfjZZoLvRviyM0nTaTLrwou.ttf", fontWeight: 700 },
  ],
});

Font.register({
  family: "Manrope",
  fonts: [
    { src: "https://fonts.gstatic.com/s/manrope/v18/xn7gYHE41ni1AdIRggexSg.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/manrope/v18/xn7gYHE41ni1AdIRgnFSSL_T.ttf", fontWeight: 500 },
    { src: "https://fonts.gstatic.com/s/manrope/v18/xn7gYHE41ni1AdIRgmJSSL_T.ttf", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/manrope/v18/xn7gYHE41ni1AdIRgg9SSL_T.ttf", fontWeight: 700 },
  ],
});

Font.register({
  family: "JetBrains Mono",
  src: "https://fonts.gstatic.com/s/jetbrainsmono/v20/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTNlOWqA.ttf",
});

// ============================================================
// Estilos (paleta Cerrado)
// ============================================================

const colors = {
  cocoa: "#1F1611",
  fur: "#C46A3F",
  tabaco: "#8E4628",
  saffron: "#E8A547",
  cream: "#F4EAD8",
  paper: "#FBF6EC",
  line: "#E6D8BD",
  ok: "#5E7C4F",
  warn: "#D78A1E",
  err: "#B23A2A",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontFamily: "Manrope",
    fontSize: 10,
    color: colors.cocoa,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandText: {
    fontFamily: "Bricolage Grotesque",
    fontSize: 18,
    fontWeight: 700,
    color: colors.cocoa,
  },
  brandTagline: {
    fontFamily: "JetBrains Mono",
    fontSize: 8,
    color: colors.tabaco,
    marginTop: 2,
  },
  meta: {
    textAlign: "right",
    fontSize: 8,
    color: colors.tabaco,
    fontFamily: "JetBrains Mono",
  },
  titleBlock: {
    marginBottom: 30,
  },
  category: {
    fontFamily: "JetBrains Mono",
    fontSize: 9,
    color: colors.tabaco,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontFamily: "Bricolage Grotesque",
    fontSize: 26,
    fontWeight: 700,
    color: colors.cocoa,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 10,
    color: colors.tabaco,
    marginTop: 6,
  },
  section: {
    marginBottom: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  sectionTitle: {
    fontFamily: "Bricolage Grotesque",
    fontSize: 13,
    fontWeight: 600,
    color: colors.cocoa,
    backgroundColor: colors.cream,
    padding: 10,
    paddingHorizontal: 14,
  },
  sectionBody: {
    padding: 14,
  },
  kvRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  kvKey: {
    width: "40%",
    fontFamily: "JetBrains Mono",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.tabaco,
    paddingRight: 8,
  },
  kvValue: {
    width: "60%",
    fontSize: 10,
    color: colors.cocoa,
  },
  kvValueGood: {
    color: colors.ok,
    fontWeight: 600,
  },
  kvValueWarn: {
    color: colors.warn,
    fontWeight: 600,
  },
  table: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.line,
  },
  tableHeader: {
    backgroundColor: colors.paper,
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontFamily: "JetBrains Mono",
    fontSize: 7,
    textTransform: "uppercase",
    color: colors.tabaco,
  },
  scoreBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  scoreNumber: {
    fontFamily: "Bricolage Grotesque",
    fontSize: 36,
    fontWeight: 700,
    color: colors.cocoa,
  },
  scoreLabel: {
    fontSize: 9,
    color: colors.tabaco,
    fontFamily: "JetBrains Mono",
  },
  emptyState: {
    backgroundColor: "#5E7C4F1A",
    borderColor: "#5E7C4F33",
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    fontSize: 9,
    color: colors.ok,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    fontFamily: "JetBrains Mono",
    fontSize: 7,
    color: colors.tabaco,
  },
  pageNumber: {
    fontFamily: "JetBrains Mono",
    fontSize: 8,
    color: colors.tabaco,
  },
  badge: {
    fontFamily: "JetBrains Mono",
    fontSize: 7,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 2,
    overflow: "hidden",
  },
});

// ============================================================
// Document
// ============================================================

interface RelatorioPDFProps {
  consultationId: string;
  result: ConsultaResult;
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
  const plano = findPlano(result.plan_tier);
  const categoriaLabel =
    result.category === "cpf"
      ? "Consulta de CPF"
      : result.category === "cnpj"
      ? "Consulta de CNPJ"
      : "Consulta Veicular";

  return (
    <Document
      author="Capivara"
      title={`Relatório ${categoriaLabel} · ${targetValue}`}
      subject={`Consulta ${result.plan_tier}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.brandText}>capivara</Text>
            <Text style={styles.brandTagline}>relatório oficial</Text>
          </View>
          <View style={styles.meta}>
            <Text>ID {consultationId.slice(0, 8)}</Text>
            <Text>{new Date(generatedAt).toLocaleString("pt-BR")}</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.category}>{categoriaLabel}</Text>
          <Text style={styles.title}>{targetValue}</Text>
          {plano && (
            <Text style={styles.subtitle}>
              Plano: {plano.nome}
            </Text>
          )}
        </View>

        {/* Sections */}
        {result.sections.map((section, i) => (
          <PDFSection key={i} section={section} />
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>capivara.app · Consulta autêntica</Text>
          <Text>
            Verificar: {verificationUrl}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

// ============================================================
// PDFSection — discriminator pelo tipo
// ============================================================

function PDFSection({ section }: { section: ResultSection }) {
  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionBody}>{renderBody(section)}</View>
    </View>
  );
}

function renderBody(section: ResultSection) {
  if (section.type === "kv") {
    return <KVList data={section.data} />;
  }
  if (section.type === "score") {
    return <ScorePDF section={section} />;
  }
  if (section.type === "list" || section.type === "table") {
    const items = (section.items as unknown[]) ?? [];
    if (items.length === 0) {
      return (
        <Text style={styles.emptyState}>
          Nenhum registro encontrado.
        </Text>
      );
    }
    return <ListOrTablePDF section={section} />;
  }
  return null;
}

function KVList({ data }: { data: Record<string, string | null> }) {
  return (
    <View>
      {Object.entries(data).map(([k, v]) => {
        const status = (v ?? "").toUpperCase().trim();
        const isGood = ["ATIVA", "REGULAR", "NEGATIVA", "NADA CONSTA", "SEM GRAVAME", "PAGA", "QUITADA"].includes(status);
        const isWarn = ["EM ABERTO", "ATIVO", "SUSPENSA"].includes(status);
        return (
          <View key={k} style={styles.kvRow}>
            <Text style={styles.kvKey}>{k}</Text>
            <Text
              style={[
                styles.kvValue,
                ...(isGood ? [styles.kvValueGood] : []),
                ...(isWarn ? [styles.kvValueWarn] : []),
              ]}
            >
              {v ?? "—"}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function ScorePDF({
  section,
}: {
  section: Extract<ResultSection, { type: "score" }>;
}) {
  const labelMap: Record<string, { l: string; c: string }> = {
    ALTO: { l: "Alto", c: colors.ok },
    MEDIO: { l: "Médio", c: colors.warn },
    BAIXO: { l: "Baixo", c: colors.err },
    MUITO_BAIXO: { l: "Muito baixo", c: colors.err },
  };
  const cls = labelMap[section.classe];

  return (
    <View style={styles.scoreBox}>
      <View>
        <Text style={styles.scoreNumber}>
          {section.valor}{" "}
          <Text style={{ fontSize: 12, color: colors.tabaco }}>
            / {section.max}
          </Text>
        </Text>
        <Text style={[styles.scoreLabel, { color: cls.c, marginTop: 4 }]}>
          {cls.l} · Bureau {section.bureau}
        </Text>
      </View>
    </View>
  );
}

function ListOrTablePDF({ section }: { section: ResultSection }) {
  // @ts-expect-error - items existe
  const items = section.items as unknown[];

  // Renderiza item a item sem se preocupar muito com colunas
  // (mock data hoje, vai melhorar quando API Full vier)
  return (
    <View style={styles.table}>
      {items.map((item, i) => (
        <View key={i} style={styles.tableRow}>
          <Text style={{ fontSize: 9, color: colors.cocoa, flex: 1 }}>
            {formatItemForPDF(section.id, item)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function formatItemForPDF(sectionId: string, item: unknown): string {
  // Formatação simples baseada no tipo. Pode evoluir depois.
  if (typeof item === "string") return item;
  if (typeof item !== "object" || item === null) return JSON.stringify(item);

  const i = item as Record<string, unknown>;

  if (sectionId === "enderecos") {
    return `${i.tipo === "atual" ? "(atual) " : "(anterior) "}${i.logradouro}, ${i.numero} · ${i.bairro}, ${i.cidade}/${i.uf} · CEP ${i.cep}`;
  }
  if (sectionId === "telefones") {
    return `${i.numero} (${i.tipo}) · cadastrado ${String(i.cadastro).slice(0, 4)}`;
  }
  if (sectionId === "parentes") {
    const vinc: Record<string, string> = {
      mae: "Mãe",
      pai: "Pai",
      irmao: "Irmão(ã)",
      filho: "Filho(a)",
      conjuge: "Cônjuge",
    };
    return `${i.nome} — ${vinc[i.vinculo as string] ?? i.vinculo}`;
  }
  if (sectionId === "empresas") {
    return `${i.razao_social} (CNPJ ${i.cnpj}) · ${i.qualificacao} · ${i.situacao}`;
  }
  if (sectionId === "empresa_socios") {
    return `${i.nome} (CPF ${i.cpf_mascarado}) · ${i.qualificacao}`;
  }
  if (sectionId === "dividas") {
    const valor = ((i.valor_centavos as number) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    return `${i.credor} · ${valor} · ${i.status === "EM_ABERTO" ? "EM ABERTO" : "QUITADA"} (origem ${i.data_origem})`;
  }
  if (sectionId === "scr_bacen") {
    const valor = ((i.saldo_centavos as number) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    return `${i.instituicao} · ${i.modalidade} · saldo ${valor} · venc ${i.vencimento}`;
  }
  if (sectionId === "veiculo_multas") {
    const valor = ((i.valor_centavos as number) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    return `${i.descricao} · ${i.data} · ${i.local} · ${valor} · ${i.pontos} pontos · ${i.status}`;
  }

  return Object.entries(i).map(([k, v]) => `${k}: ${v}`).join(" · ");
}
