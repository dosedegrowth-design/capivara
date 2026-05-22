import Link from "next/link";
import { Mascot } from "@/components/capivara/mascot";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper-2 mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Mascot pose="concluido" size={32} animate={false} />
              <span className="font-display text-xl font-bold text-cocoa">capivara</span>
            </Link>
            <p className="text-sm text-tabaco leading-relaxed max-w-sm">
              Puxe a capivara antes de fechar negócio. Consulta rápida e
              completa de pessoas, empresas e veículos.
            </p>
          </div>

          {/* Produto */}
          <div>
            <h4 className="font-display text-sm font-semibold text-cocoa mb-3">
              Produto
            </h4>
            <ul className="space-y-2 text-sm text-tabaco">
              <li><Link href="/consultar/cpf" className="hover:text-fur transition-colors">Consulta CPF</Link></li>
              <li><Link href="/consultar/cnpj" className="hover:text-fur transition-colors">Consulta CNPJ</Link></li>
              <li><Link href="/consultar/veicular" className="hover:text-fur transition-colors">Consulta veicular</Link></li>
              <li><Link href="/precos" className="hover:text-fur transition-colors">Preços</Link></li>
              <li><Link href="/empresas" className="hover:text-fur transition-colors">Para empresas</Link></li>
            </ul>
          </div>

          {/* Developers / API */}
          <div>
            <h4 className="font-display text-sm font-semibold text-cocoa mb-3">
              Developers
            </h4>
            <ul className="space-y-2 text-sm text-tabaco">
              <li><Link href="/api-publica" className="hover:text-fur transition-colors">API Capivara</Link></li>
              <li><Link href="/docs/api" className="hover:text-fur transition-colors">Documentação</Link></li>
              <li><Link href="/docs/webhooks" className="hover:text-fur transition-colors">Webhooks</Link></li>
              <li><Link href="/empresa/api" className="hover:text-fur transition-colors">Gerar chave</Link></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-display text-sm font-semibold text-cocoa mb-3">
              Empresa
            </h4>
            <ul className="space-y-2 text-sm text-tabaco">
              <li><Link href="/como-funciona" className="hover:text-fur transition-colors">Como funciona</Link></li>
              <li><Link href="/lgpd" className="hover:text-fur transition-colors">Privacidade · LGPD</Link></li>
              <li><Link href="/contato" className="hover:text-fur transition-colors">Contato</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-line">
          <p className="text-xs font-mono text-tabaco/70">
            © 2026 Capivara · Mantido pela{" "}
            <a
              href="https://dosedegrowth.com.br"
              className="hover:text-fur transition-colors underline-offset-4 hover:underline"
            >
              Dose de Growth
            </a>
          </p>
          <p className="text-xs font-mono text-tabaco/60">
            CNPJ XX.XXX.XXX/0001-XX
          </p>
        </div>
      </div>
    </footer>
  );
}
