import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LegalDocument } from "@/lib/legal/documents";

/**
 * Renderiza um documento legal em formato leitura publica.
 *
 * Markdown-lite: parser inline pra titulos #/##/###, listas - / 1., bold **,
 * codigo inline e tabelas markdown simples.
 *
 * Mantemos parser proprio leve em vez de adicionar mais uma lib —
 * o markdown dos documentos legais e controlado.
 */
export function LegalDocumentView({
  doc,
  hash,
}: {
  doc: LegalDocument;
  hash: string;
}) {
  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-tabaco hover:text-fur transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          Capivara
        </Link>

        <header className="mb-8 pb-6 border-b border-line">
          <Badge variant="outline" className="mb-3 font-mono">
            <FileText className="size-3 mr-1 inline" />
            Documento legal · v{doc.version}
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
            {doc.title}
          </h1>
          <p className="text-sm text-tabaco mt-2">
            Em vigor desde{" "}
            <time dateTime={doc.effectiveDate}>
              {new Date(doc.effectiveDate).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </time>
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-info/30 bg-info/5 px-3 py-1.5 text-xs font-mono text-info">
            <ShieldCheck className="size-3.5" />
            <span>
              SHA-256: <code className="text-cocoa">{hash.slice(0, 16)}…{hash.slice(-8)}</code>
            </span>
          </div>
        </header>

        <article className="prose-cerrado">
          <MarkdownLite text={doc.text} />
        </article>

        <footer className="mt-12 pt-6 border-t border-line text-xs font-mono text-tabaco">
          <p>
            Documento versão <strong>{doc.version}</strong> · Hash de integridade:{" "}
            <code className="text-cocoa">{hash}</code>
          </p>
          <p className="mt-2">
            Em caso de divergência sobre o que você aceitou em algum momento,
            consulte o histórico em{" "}
            <Link href="/configuracoes/meus-aceites" className="text-fur hover:underline">
              /configuracoes/meus-aceites
            </Link>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}

/**
 * Renderizador markdown inline minimalista.
 *
 * Suporta:
 *  - # ## ### titulos
 *  - **bold**
 *  - `inline code`
 *  - listas - bullet e 1. ordenadas
 *  - tabelas | a | b |
 *  - paragrafos com texto plano
 *  - --- separadores
 */
function MarkdownLite({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let tableBuffer: string[] = [];
  let key = 0;

  function flushList() {
    if (listBuffer.length === 0) return;
    const items = listBuffer.map((item, i) => (
      <li key={i} className="mb-1">
        {parseInline(item)}
      </li>
    ));
    elements.push(
      listType === "ol" ? (
        <ol key={`l-${key++}`} className="list-decimal list-inside ml-2 my-3 space-y-1 text-cocoa">
          {items}
        </ol>
      ) : (
        <ul key={`l-${key++}`} className="list-disc list-inside ml-2 my-3 space-y-1 text-cocoa">
          {items}
        </ul>
      )
    );
    listBuffer = [];
    listType = null;
  }

  function flushTable() {
    if (tableBuffer.length === 0) return;
    const rows = tableBuffer
      .filter((r) => !/^[\s\|\-:]+$/.test(r)) // remove linha de separador ---|---
      .map((r) =>
        r
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim())
      );
    if (rows.length > 0) {
      const [headerRow, ...bodyRows] = rows;
      elements.push(
        <div
          key={`t-${key++}`}
          className="my-4 overflow-x-auto rounded-md border border-line"
        >
          <table className="w-full text-sm">
            <thead className="bg-paper-2/60">
              <tr>
                {headerRow.map((c, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-left text-xs font-mono uppercase tracking-wider text-tabaco"
                  >
                    {parseInline(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri} className="border-t border-line/40">
                  {row.map((c, ci) => (
                    <td key={ci} className="px-3 py-2 text-cocoa">
                      {parseInline(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableBuffer = [];
  }

  for (const raw of lines) {
    const line = raw;

    // Tabelas (linha com |)
    if (/^\|.*\|\s*$/.test(line)) {
      flushList();
      tableBuffer.push(line);
      continue;
    }
    if (tableBuffer.length > 0 && !/^\|/.test(line)) {
      flushTable();
    }

    // Headings
    if (/^#{1,3}\s+/.test(line)) {
      flushList();
      const level = line.match(/^(#{1,3})/)![1].length;
      const content = line.replace(/^#{1,3}\s+/, "");
      if (level === 1) {
        elements.push(
          <h2
            key={`h-${key++}`}
            className="font-display text-2xl md:text-3xl font-bold text-cocoa mt-8 mb-3"
          >
            {parseInline(content)}
          </h2>
        );
      } else if (level === 2) {
        elements.push(
          <h3
            key={`h-${key++}`}
            className="font-display text-xl font-bold text-cocoa mt-6 mb-2"
          >
            {parseInline(content)}
          </h3>
        );
      } else {
        elements.push(
          <h4
            key={`h-${key++}`}
            className="font-display text-base font-semibold text-cocoa mt-4 mb-2"
          >
            {parseInline(content)}
          </h4>
        );
      }
      continue;
    }

    // Lista bullet
    if (/^-\s+/.test(line)) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listBuffer.push(line.replace(/^-\s+/, ""));
      continue;
    }
    // Lista ordenada
    if (/^\d+\.\s+/.test(line)) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listBuffer.push(line.replace(/^\d+\.\s+/, ""));
      continue;
    }

    // Separador
    if (/^---+$/.test(line.trim())) {
      flushList();
      elements.push(<hr key={`hr-${key++}`} className="my-6 border-line" />);
      continue;
    }

    // Linha vazia
    if (line.trim() === "") {
      flushList();
      continue;
    }

    // Paragrafo
    flushList();
    elements.push(
      <p key={`p-${key++}`} className="text-cocoa leading-relaxed mb-3">
        {parseInline(line)}
      </p>
    );
  }

  flushList();
  flushTable();

  return <>{elements}</>;
}

/** Parser inline simples: **bold**, `code`, [link](url) */
function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < text.length) {
    // Bold
    if (text.slice(i, i + 2) === "**") {
      const end = text.indexOf("**", i + 2);
      if (end > -1) {
        nodes.push(
          <strong key={key++} className="font-semibold text-cocoa">
            {text.slice(i + 2, end)}
          </strong>
        );
        i = end + 2;
        continue;
      }
    }
    // Inline code
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end > -1) {
        nodes.push(
          <code
            key={key++}
            className="font-mono text-xs bg-paper-2 px-1.5 py-0.5 rounded text-fur"
          >
            {text.slice(i + 1, end)}
          </code>
        );
        i = end + 1;
        continue;
      }
    }
    // Link [label](url)
    if (text[i] === "[") {
      const labelEnd = text.indexOf("]", i + 1);
      if (labelEnd > -1 && text[labelEnd + 1] === "(") {
        const urlEnd = text.indexOf(")", labelEnd + 2);
        if (urlEnd > -1) {
          const label = text.slice(i + 1, labelEnd);
          const url = text.slice(labelEnd + 2, urlEnd);
          nodes.push(
            <a
              key={key++}
              href={url}
              className="text-fur hover:underline"
              target={url.startsWith("http") ? "_blank" : undefined}
              rel="noopener"
            >
              {label}
            </a>
          );
          i = urlEnd + 1;
          continue;
        }
      }
    }
    // Char normal — acumula no buffer ate proximo token especial
    let j = i;
    while (
      j < text.length &&
      text[j] !== "*" &&
      text[j] !== "`" &&
      text[j] !== "["
    ) {
      j++;
    }
    nodes.push(text.slice(i, j));
    i = j;
    // Se for um asterisco isolado sem fechar, pula
    if (i < text.length && text[i] === "*" && text.slice(i, i + 2) !== "**") {
      nodes.push("*");
      i++;
    }
  }

  return nodes;
}
