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
              <li><Link href="/sobre" className="hover:text-fur transition-colors">Sobre</Link></li>
              <li><Link href="/como-funciona" className="hover:text-fur transition-colors">Como funciona</Link></li>
              <li><Link href="/casos-de-uso" className="hover:text-fur transition-colors">Casos de uso</Link></li>
              <li><Link href="/comparar" className="hover:text-fur transition-colors">Comparar</Link></li>
              <li><Link href="/status" className="hover:text-fur transition-colors">Status</Link></li>
              <li><Link href="/contato" className="hover:text-fur transition-colors">Contato</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer secundário: legal */}
        <div className="mt-10 pt-6 border-t border-line/60 grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <h5 className="font-mono uppercase tracking-wider text-tabaco/70 text-[10px] mb-2">
              Legal
            </h5>
            <ul className="space-y-1 text-tabaco">
              <li><Link href="/termos" className="hover:text-fur transition-colors">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-fur transition-colors">Política de Privacidade</Link></li>
              <li><Link href="/cookies" className="hover:text-fur transition-colors">Política de Cookies</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-mono uppercase tracking-wider text-tabaco/70 text-[10px] mb-2">
              B2B
            </h5>
            <ul className="space-y-1 text-tabaco">
              <li><Link href="/empresa-termos" className="hover:text-fur transition-colors">Termos B2B / Empresa</Link></li>
              <li><Link href="/api-termos" className="hover:text-fur transition-colors">Termos da API</Link></li>
              <li><Link href="/responsabilidade-consulta" className="hover:text-fur transition-colors">Responsabilidade por Consulta</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-mono uppercase tracking-wider text-tabaco/70 text-[10px] mb-2">
              Hub
            </h5>
            <ul className="space-y-1 text-tabaco">
              <li><Link href="/legal" className="hover:text-fur transition-colors">Todos os documentos</Link></li>
              <li><Link href="/configuracoes/meus-aceites" className="hover:text-fur transition-colors">Meus aceites (LGPD)</Link></li>
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
