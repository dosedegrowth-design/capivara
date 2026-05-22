import Link from "next/link";
import { Mascot } from "@/components/capivara/mascot";

/**
 * Layout das paginas de auth (login, cadastro, recuperar-senha).
 *
 * Visual:
 *  - Background cocoa gradient com glow orbs saffron/fur
 *  - Pattern de pontinhos cream sutil
 *  - Hexagonos decorativos no fundo (assinatura visual Cerrado)
 *  - Header glass + footer minimalista
 *  - Children renderizados centralizados sobre o card glass
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-cocoa text-cream overflow-hidden">
      {/* Layer 1: gradient cocoa -> noite */}
      <div
        aria-hidden
        className="absolute inset-0 -z-30 bg-gradient-to-br from-cocoa via-[#2a1d15] to-[#1a120d]"
      />

      {/* Layer 2: glow orbs */}
      <div
        aria-hidden
        className="absolute -top-32 -left-32 size-[420px] rounded-full bg-saffron/22 blur-3xl -z-20"
      />
      <div
        aria-hidden
        className="absolute top-1/4 -right-40 size-[520px] rounded-full bg-fur/18 blur-3xl -z-20"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 left-1/3 size-[420px] rounded-full bg-tabaco/30 blur-3xl -z-20"
      />

      {/* Layer 3: pattern de pontinhos */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #F4EAD8 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Layer 4: hexagonos sutis */}
      <svg
        aria-hidden
        className="absolute top-1/3 right-8 w-40 h-40 -z-10 opacity-[0.04]"
        viewBox="0 0 100 100"
        fill="none"
        stroke="#F4EAD8"
        strokeWidth="0.6"
      >
        <polygon points="50,5 90,30 90,70 50,95 10,70 10,30" />
        <polygon points="50,20 75,35 75,65 50,80 25,65 25,35" />
        <polygon points="50,35 60,42 60,58 50,65 40,58 40,42" />
      </svg>
      <svg
        aria-hidden
        className="absolute bottom-20 left-8 w-32 h-32 -z-10 opacity-[0.04]"
        viewBox="0 0 100 100"
        fill="none"
        stroke="#F4EAD8"
        strokeWidth="0.6"
      >
        <polygon points="50,5 90,30 90,70 50,95 10,70 10,30" />
        <polygon points="50,20 75,35 75,65 50,80 25,65 25,35" />
      </svg>

      {/* Header glass */}
      <header className="relative z-10 border-b border-cream/10 bg-cocoa/40 backdrop-blur-md">
        <div className="mx-auto max-w-6xl h-16 px-4 sm:px-6 flex items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <Mascot pose="padrao" size={32} animate={false} />
            <span className="font-display text-lg font-bold text-cream group-hover:text-saffron transition-colors">
              capivara
            </span>
          </Link>
        </div>
      </header>

      {/* Main centralizado */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cream/10 py-4 bg-cocoa/30 backdrop-blur-sm">
        <p className="text-center text-xs font-mono text-cream/60">
          © 2026 Capivara · Dose de Growth
        </p>
      </footer>
    </div>
  );
}
