import Image from "next/image";

/**
 * Pagina inicial · placeholder do MVP.
 * Sera substituida pela landing B2C definitiva na Fase 2 do plano de execucao.
 *
 * Por enquanto: confirma que tokens Cerrado estao aplicados,
 * fontes carregando corretamente, mascote renderizando.
 */
export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-paper text-cocoa">
      <main className="flex flex-col items-center gap-10 max-w-2xl px-8 py-16 text-center">
        <div className="capivara-idle">
          <Image
            src="/brand/mascot/investigando.svg"
            alt="Capivara investigando"
            width={180}
            height={180}
            priority
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-tabaco">
            Cerrado · v1.0
          </span>
          <h1 className="font-display text-5xl font-bold tracking-tight md:text-6xl">
            capivara
          </h1>
          <p className="max-w-md text-lg text-tabaco leading-relaxed">
            Puxe a capivara antes de fechar negocio.
            <br />
            Em construcao — voltamos em breve.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-tabaco">
          <span className="px-3 py-1.5 rounded-full bg-cream border border-line">
            Next.js 16
          </span>
          <span className="px-3 py-1.5 rounded-full bg-cream border border-line">
            Tailwind v4
          </span>
          <span className="px-3 py-1.5 rounded-full bg-cream border border-line">
            Supabase
          </span>
          <span className="px-3 py-1.5 rounded-full bg-cream border border-line">
            Asaas
          </span>
        </div>

        <footer className="mt-12 text-xs font-mono text-tabaco/60">
          Dose de Growth · 2026
        </footer>
      </main>
    </div>
  );
}
