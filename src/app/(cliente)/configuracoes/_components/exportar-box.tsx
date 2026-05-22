"use client";

import { useState, useTransition } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportarDadosAction } from "../actions";

export function ExportarBox() {
  const [pending, startTransition] = useTransition();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function handle() {
    setErr(null);
    setDownloadUrl(null);
    startTransition(async () => {
      const res = await exportarDadosAction();
      if (res.ok) setDownloadUrl(res.downloadUrl);
      else setErr(res.error);
    });
  }

  return (
    <div className="space-y-3">
      <Button onClick={handle} disabled={pending} variant="secondary">
        <FileText className="size-4 mr-1" />
        {pending ? "Gerando..." : "Gerar exportação"}
      </Button>

      {downloadUrl && (
        <div className="rounded-md border border-ok/30 bg-ok/5 p-3">
          <p className="text-sm text-cocoa mb-2">Arquivo pronto. Link válido por 24h.</p>
          <a
            href={downloadUrl}
            download="capivara-meus-dados.json"
            className="inline-flex items-center gap-1 text-sm font-medium text-fur hover:underline"
          >
            <Download className="size-4" />
            Baixar capivara-meus-dados.json
          </a>
        </div>
      )}

      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
