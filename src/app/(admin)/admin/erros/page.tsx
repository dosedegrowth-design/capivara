import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/capivara/mascot";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateTimeBR } from "@/lib/formatters";

export default async function ErrosPage() {
  const admin = createAdminClient();
  const { data: errors } = await admin
    .from("error_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const abertos = (errors ?? []).filter((e) => !e.resolved);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <header>
        <Badge variant="outline" className="mb-2 font-mono">
          Admin · Erros & logs
        </Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">
          Logs de erro
        </h1>
        <p className="text-tabaco mt-1">
          {abertos.length} aberto(s) · {(errors?.length ?? 0) - abertos.length} resolvido(s)
        </p>
      </header>

      {!errors || errors.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-card p-12 text-center">
          <Mascot pose="concluido" size={80} animate="idle" />
          <h3 className="font-display text-lg font-bold text-cocoa mt-4">
            Tudo correndo bem
          </h3>
          <p className="text-tabaco mt-1 text-sm">
            Nenhum erro registrado. Quando algo der errado em produção, vai aparecer aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {errors.map((e) => (
            <div
              key={e.id}
              className={`rounded-lg border p-4 ${
                e.resolved
                  ? "border-line bg-card opacity-60"
                  : e.severity === "critical"
                  ? "border-err bg-err/10"
                  : e.severity === "error"
                  ? "border-err/40 bg-err/5"
                  : e.severity === "warning"
                  ? "border-warn/40 bg-warn/5"
                  : "border-info/40 bg-info/5"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      e.severity === "critical" || e.severity === "error"
                        ? "err"
                        : e.severity === "warning"
                        ? "warn"
                        : "info"
                    }
                  >
                    {e.severity}
                  </Badge>
                  <code className="text-xs font-mono text-tabaco bg-paper-2 px-2 py-0.5 rounded">
                    {e.context}
                  </code>
                </div>
                <span className="text-xs font-mono text-tabaco whitespace-nowrap">
                  {formatDateTimeBR(e.created_at)}
                </span>
              </div>
              <p className="text-cocoa text-sm font-medium">{e.message}</p>
              {e.stack_trace && (
                <details className="mt-2">
                  <summary className="text-xs text-tabaco cursor-pointer hover:text-fur">
                    Stack trace
                  </summary>
                  <pre className="mt-2 text-[10px] font-mono text-tabaco overflow-x-auto bg-paper-2 p-2 rounded">
                    {e.stack_trace}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
