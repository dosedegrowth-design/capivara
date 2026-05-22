import Link from "next/link";
import { Mascot } from "@/components/capivara/mascot";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto max-w-6xl h-16 px-4 sm:px-6 flex items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <Mascot pose="padrao" size={32} animate={false} />
            <span className="font-display text-lg font-bold text-cocoa group-hover:text-fur transition-colors">
              capivara
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      <footer className="border-t border-line py-4">
        <p className="text-center text-xs font-mono text-tabaco/60">
          © 2026 Capivara · Dose de Growth
        </p>
      </footer>
    </div>
  );
}
