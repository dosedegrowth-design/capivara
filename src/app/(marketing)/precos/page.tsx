import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, UserRound, Building2, CarFront } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanCarousel } from "@/components/consulta/plan-carousel";
import {
  PLANOS_CPF,
  PLANOS_CNPJ,
  PLANOS_VEICULAR,
  PACOTES_MANADA,
  type Plano,
} from "@/lib/consultas/planos";
import { formatBRL } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Preços · Capivara",
  description:
    "Planos para pessoa física (avulsos a partir de R$ 7,90) ou empresarial (pacotes Manada com até 50% de bônus).",
};

/**
 * Descricoes detalhadas de cada plano — fonte da verdade.
 * Aparecem como bullets no PlanCard.
 */
const RESUMO_INCLUI: Record<string, string[]> = {
  // ---- CPF ----
  "cpf-espiadinha": [
    "Nome completo e nome da mãe",
    "Data de nascimento e idade",
    "Situação cadastral do CPF na Receita",
    "Confirmação rápida de identidade",
  ],
  "cpf-investigacao": [
    "Tudo da Espiadinha",
    "Endereços completos (atuais e histórico)",
    "Telefones cadastrados em bases públicas",
    "E-mails associados a esse CPF",
    "Parentes diretos (mãe, pai, irmãos)",
    "Empresas em que figura como sócio",
  ],
  "cpf-avancada": [
    "Tudo da Investigação",
    "Ultra Completo (400+ bases unificadas)",
    "Score de crédito Boa Vista",
    "Pendências financeiras e dívidas em aberto",
    "Protestos cartoriais e histórico",
    "Imóveis e veículos vinculados",
  ],
  "cpf-premium": [
    "Tudo da Avançada",
    "Score e relatório Serasa Premium",
    "Cheques sem fundos e sustados",
    "Certidão Negativa de Débitos Trabalhistas",
    "Informações QUOD (dívidas e crédito)",
    "Cenprot (protestos nacionais)",
  ],
  "cpf-raio-x": [
    "Tudo da Premium",
    "SPC Brasil completo",
    "SCR BACEN (operações no Banco Central)",
    "Busca reversa por documentos (RG, CNH)",
    "Histórico de consultas feitas no CPF",
    "Análise consolidada multi-bureau",
  ],

  // ---- CNPJ ----
  "cnpj-espiadinha": [
    "Razão social e nome fantasia",
    "Situação cadastral na Receita Federal",
    "CNAE principal e secundários",
    "Quadro de sócios e endereço",
    "Data de abertura e capital social",
  ],
  "cnpj-socios": [
    "Tudo da Espiadinha",
    "CPF Ultra Completo dos sócios (até 3)",
    "Certidão Trabalhista da empresa",
    "Vínculos empresariais dos sócios",
    "Endereços e contatos dos sócios",
  ],
  "cnpj-premium": [
    "Tudo do +Sócios",
    "Cred Plus (análise consolidada de risco)",
    "Score de crédito empresarial",
    "Serasa e Boa Vista dos sócios",
    "Situação tributária e pendências fiscais",
    "Protestos cartoriais da empresa",
  ],
  "cnpj-total": [
    "Tudo do Premium",
    "Análise de risco detalhada (fraude, blacklist)",
    "Protestos atualizados (CNPJ + sócios)",
    "SCR BACEN dos sócios",
    "Score consolidado multi-bureau",
    "Histórico de relacionamento bancário",
  ],

  // ---- Veicular ----
  "veicular-espiadinha": [
    "Marca, modelo, versão e ano",
    "Cor predominante e combustível",
    "Chassi e número de motor",
    "Valor Fipe atualizado",
    "Município e UF de licenciamento",
  ],
  "veicular-completo": [
    "Tudo da Espiadinha",
    "BIN Nacional consolidado",
    "Recall ativo do fabricante",
    "Categoria e espécie do veículo",
    "Capacidade e tipo de carroceria",
  ],
  "veicular-avancado": [
    "Tudo do Completo",
    "BIN Estadual com dados regionais detalhados",
    "Nome e documento do proprietário atual",
    "Gravame (alienação fiduciária ativa)",
    "Histórico nacional de roubo e furto",
    "Restrições judiciais",
  ],
  "veicular-premium": [
    "Tudo do Avançado",
    "Histórico de leilão (sinistro, judicial)",
    "Certificado de Segurança Veicular (CSV)",
    "RENAJUD (restrições judiciais ativas)",
    "RENAINF (infrações de trânsito)",
    "Verificação de adulteração estrutural",
  ],
  "veicular-total": [
    "Tudo do Premium",
    "Vip Car (relatório completo de concessionária)",
    "CRLV digital (documento do veículo)",
    "Fotos do veículo no leilão (se houver)",
    "Histórico de proprietários anteriores",
    "Análise técnica completa pré-compra",
  ],
};

export default function PrecosPage() {
  return (
    <div className="bg-paper">
      <Header />
      <Tabs defaultValue="pf" className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="pf">Pessoa física</TabsTrigger>
            <TabsTrigger value="pj">Empresarial</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pf" className="space-y-20">
          <CategoriaPlanos
            categoria="CPF"
            descricao="Verifique pessoas: score, dívidas, histórico e vínculos."
            icone={<UserRound className="size-5" />}
            cor="bg-info/15 text-info"
            planos={PLANOS_CPF}
          />
          <CategoriaPlanos
            categoria="CNPJ"
            descricao="Verifique empresas: situação, sócios, crédito e tributário."
            icone={<Building2 className="size-5" />}
            cor="bg-sage/20 text-sage"
            planos={PLANOS_CNPJ}
          />
          <CategoriaPlanos
            categoria="Veicular"
            descricao="Verifique veículos: proprietário, gravame, leilão e recall."
            icone={<CarFront className="size-5" />}
            cor="bg-saffron/25 text-fur"
            planos={PLANOS_VEICULAR}
          />
        </TabsContent>

        <TabsContent value="pj">
          <PainelEmpresarial />
        </TabsContent>
      </Tabs>

      <ChamadaFinal />
    </div>
  );
}

// =========================================================================
// Header da pagina
// =========================================================================

function Header() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <Badge variant="outline" className="mb-3 font-mono">
          Planos e preços
        </Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-cocoa">
          Sem mensalidade. Você só paga o que consultar.
        </h1>
        <p className="mt-4 text-tabaco text-lg leading-relaxed">
          5 planos por categoria, do mais leve (R$ 7,90) ao mais completo
          (R$ 199,90). Empresas têm desconto via créditos (até 58%).
        </p>
      </div>
    </section>
  );
}

// =========================================================================
// Bloco de planos por categoria
// =========================================================================

function CategoriaPlanos({
  categoria,
  descricao,
  icone,
  cor,
  planos,
}: {
  categoria: string;
  descricao: string;
  icone: React.ReactNode;
  cor: string;
  planos: Plano[];
}) {
  return (
    <section className="space-y-8">
      <div className="flex items-start gap-4 max-w-3xl">
        <span
          className={`size-12 rounded-md flex items-center justify-center shrink-0 ${cor}`}
        >
          {icone}
        </span>
        <div>
          <h2 className="font-display text-3xl font-bold text-cocoa">
            {categoria}
          </h2>
          <p className="text-tabaco mt-1">{descricao}</p>
        </div>
      </div>

      {/* Carrossel horizontal: ~4 cards visiveis em desktop, swipe em mobile */}
      <PlanCarousel planos={planos} inclui={RESUMO_INCLUI} cardWidth={300} />
    </section>
  );
}

// =========================================================================
// Painel empresarial — pacotes Manada
// =========================================================================

function PainelEmpresarial() {
  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
            Pacotes Manada para empresas que consultam volume.
          </h2>
          <p className="mt-3 text-tabaco">
            Compre créditos antecipados e consuma conforme uso. Quanto maior o
            pacote, maior o bônus. Sem mensalidade.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PACOTES_MANADA.map((pacote, i) => (
            <div
              key={pacote.id}
              className={`relative flex flex-col rounded-lg border p-6 bg-card transition-all duration-200 ease-[var(--ease-cap)] hover:shadow-[var(--shadow-pop)] hover:-translate-y-0.5 ${
                i === 1 ? "border-saffron ring-1 ring-saffron/30" : "border-line"
              }`}
            >
              {i === 1 && (
                <Badge variant="accent" className="absolute -top-3 left-6">
                  Mais escolhido
                </Badge>
              )}
              <h3 className="font-display text-xl font-bold text-cocoa">
                {pacote.nome}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-cocoa">
                  {formatBRL(pacote.valor_centavos)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <span className="font-mono font-bold text-fur">
                  {pacote.folhasTotais}
                </span>
                <span className="text-tabaco">créditos</span>
                <Badge variant="ok" className="text-[10px] py-0">
                  +{pacote.bonusPercent}% bônus
                </Badge>
              </div>

              <ul className="mt-5 mb-6 space-y-2 flex-1">
                {pacote.recursos.map((r) => (
                  <li
                    key={r}
                    className="flex items-start gap-2 text-sm text-cocoa"
                  >
                    <Check className="size-4 shrink-0 text-ok mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={i === 1 ? "accent" : "secondary"}
                size="md"
                className="w-full"
              >
                <Link href="/cadastro?tipo=empresa">Começar</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-card p-6 md:p-8">
        <h3 className="font-display text-xl font-bold text-cocoa mb-4">
          Como cada plano consome créditos
        </h3>
        <p className="text-sm text-tabaco mb-6">
          Empresas pagam o mesmo conteúdo dos planos avulsos B2C com até 40%
          menos. Veja a equivalência:
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <ConsumoTabela titulo="CPF" planos={PLANOS_CPF} />
          <ConsumoTabela titulo="CNPJ" planos={PLANOS_CNPJ} />
          <ConsumoTabela titulo="Veicular" planos={PLANOS_VEICULAR} />
        </div>
      </section>

      <section className="rounded-lg bg-cocoa text-cream p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl font-bold mb-2">
              Empresa grande? Vamos conversar.
            </h3>
            <p className="text-cream/80 max-w-lg">
              A partir de 4.500 créditos/mês temos planos sob medida com SLA,
              account manager e cache estendido (até 7 dias).
            </p>
          </div>
          <Button asChild variant="accent" size="lg">
            <Link href="/contato?tipo=enterprise">
              Falar com vendas
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function ConsumoTabela({
  titulo,
  planos,
}: {
  titulo: string;
  planos: Plano[];
}) {
  return (
    <div>
      <h4 className="font-display text-base font-semibold text-cocoa mb-3">
        {titulo}
      </h4>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-tabaco text-xs">
            <th className="text-left font-mono font-medium py-2">Plano</th>
            <th className="text-right font-mono font-medium py-2">Créditos</th>
            <th className="text-right font-mono font-medium py-2">Avulso</th>
          </tr>
        </thead>
        <tbody>
          {planos.map((p) => (
            <tr key={p.id} className="border-b border-line/50 last:border-0">
              <td className="py-2 text-cocoa">{p.nome}</td>
              <td className="py-2 text-right font-mono font-bold text-fur">
                {p.custoFolhasB2B}
              </td>
              <td className="py-2 text-right font-mono text-tabaco">
                {formatBRL(p.precoB2C_centavos)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =========================================================================
// Chamada final
// =========================================================================

function ChamadaFinal() {
  return (
    <section className="pb-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
        <p className="text-tabaco mb-4">
          Dúvidas sobre qual plano escolher?{" "}
          <Link
            href="/como-funciona"
            className="text-fur underline-offset-4 hover:underline"
          >
            Veja como funciona
          </Link>
          {" "}ou{" "}
          <Link
            href="/contato"
            className="text-fur underline-offset-4 hover:underline"
          >
            entre em contato
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
