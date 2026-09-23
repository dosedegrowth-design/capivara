import { ProdutoAvulsoCard } from "@/components/consulta/produto-avulso-card";
import { Badge } from "@/components/ui/badge";
import type { ProdutoAvulso } from "@/lib/consultas/planos";

/**
 * Secao "consultas pontuais" pras landings de categoria.
 *
 * Complementa os combos: quem so precisa de UM dado (processos, antecedentes,
 * CNH...) compra avulso em vez de pagar o plano inteiro.
 */
export function ProdutosAvulsosSection({
  produtos,
  titulo = "Precisa de só um dado?",
  subtitulo,
}: {
  produtos: ProdutoAvulso[];
  titulo?: string;
  subtitulo?: string;
}) {
  if (produtos.length === 0) return null;

  return (
    <section className="py-16 bg-paper-2 border-t border-line">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-3 font-mono">
            Consultas pontuais
          </Badge>
          <h2 className="font-display text-3xl font-bold text-cocoa">
            {titulo}
          </h2>
          {subtitulo ? (
            <p className="mt-3 text-tabaco max-w-2xl mx-auto leading-relaxed">
              {subtitulo}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4">
          {produtos.map((produto) => (
            <ProdutoAvulsoCard key={produto.id} produto={produto} />
          ))}
        </div>
      </div>
    </section>
  );
}
