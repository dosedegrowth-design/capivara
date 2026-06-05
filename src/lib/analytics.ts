/**
 * Helper pra disparar eventos customizados no Plausible.
 *
 * Uso:
 *   import { track } from "@/lib/analytics";
 *   track("consulta_iniciada", { categoria: "cpf", plano_id: "cpf-espiadinha" });
 *
 * No-op quando window/plausible ausente — seguro chamar em qualquer
 * contexto sem precisar checar.
 */

type PlausibleProps = Record<string, string | number | boolean>;

interface PlausibleWindow {
  plausible?: (
    event: string,
    opts?: { props?: Record<string, unknown> }
  ) => void;
}

export function track(eventName: string, props?: PlausibleProps): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as PlausibleWindow;
  if (w.plausible) {
    w.plausible(eventName, props ? { props } : undefined);
  }
}
