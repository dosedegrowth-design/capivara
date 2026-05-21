import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/capivara/mascot";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <Mascot pose="padrao" size={36} animate={false} />
          <span className="font-display text-xl font-bold text-cocoa group-hover:text-fur transition-colors">
            capivara
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-cocoa">
          <Link href="/precos" className="hover:text-fur transition-colors">
            Preços
          </Link>
          <Link href="/como-funciona" className="hover:text-fur transition-colors">
            Como funciona
          </Link>
          <Link href="/empresas" className="hover:text-fur transition-colors">
            Para empresas
          </Link>
          <Link href="/lgpd" className="hover:text-fur transition-colors">
            LGPD
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild variant="accent" size="sm">
            <Link href="/consultar">Puxar capivara</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
