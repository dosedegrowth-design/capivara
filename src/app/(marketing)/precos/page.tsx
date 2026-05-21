import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, UserRound, Building2, CarFront } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanCard } from "@/components/consulta/plan-card";
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

const RESUMO_INCLUI: Record<string, string[]> = {
  // CPF
  "cpf-espiadinha": ["Dados cadastrais oficiais", "Confirmação de identidade"],
  "cpf-investigacao": [
    "Cadastro completo",
    "Endereços e telefones",
    "E-mails e parentes",
    "Empresas vinculadas",
  ],
  "cpf-avancada": [
    "Ultra Completo (400+ bases)",
    "Score Boa Vista",
    "Pendências financeiras",
    "Protestos e histórico",
  ],
  "cpf-premium": [
    "Tudo da Avançada +",
    "Serasa Premium",
    "Certidão Trabalhista",
    "QUOD",
  ],
  "cpf-raio-x": [
    "Tudo da Premium +",
    "SPC Brasil",
    "SCR BACEN",
    "Busca reversa por documentos",
  ],
  // CNPJ
  "cnpj-espiadinha": [
    "Razão social, situação, CNAE",
    "Sócios e endereço",
  ],
  "cnpj-socios": [
    "Tudo da Espiadinha +",
    "CPF Ultra dos sócios (até 3)",
    "Certidão Trabalhista da empresa",
  ],
  "cnpj-premium": [
    "Tudo + Sócios +",
    "Cred Plus",
    "Serasa dos sócios",
    "Histórico fiscal",
  ],
  "cnpj-total": [
    "Tudo da Premium +",
    "Análise de risco",
    "Protestos",
    "SCR BACEN dos sócios",
  ],
  // Veicular
  "veicular-espiadinha": [
    "Placa, marca, modelo, ano, cor",
    "Chassi e valor Fipe",
  ],
  "veicular-completo": [
    "Tudo da Espiadinha +",
    "BIN Nacional",
    "Recall ativo",
  ],
  "veicular-avancado": [
    "Tudo do Completo +",
    "BIN Estadual",
    "Proprietário atual",
    "Gravame e financiamento",
    "Histórico de roubo/furto",
  ],
  "veicular-premium": [
    "Tudo do Avançado +",
    "Leilão",
    "Certificado de Segurança Veicular",
    "RENAJUD",
  ],
  "veicular-total": [
    "Tudo do Premium +",
    "Vip Car",
    "CRLV",
    "Foto Leilão",
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

        <TabsContent value="pf" className="space-y-16">
          <CategoriaPlanos
            categoria="CPF"
            icone={<UserRound className="size-5" />}
            cor="bg-info/15 text-info"
            planos={PLANOS_CPF}
          />
          <CategoriaPlanos
            categoria="CNPJ"
            icone={<Building2 className="size-5" />}
            cor="bg-sage/20 text-sage"
            planos={PLANOS_CNPJ}
          />
          <CategoriaPlanos
            categoria="Veicular"
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
          Sem mensalidade. Você só paga o que puxar.
        </h1>
        <p className="mt-4 text-tabaco text-lg leading-relaxed">
          5 planos por categoria — do mais leve (R$ 7,90) ao mais completo
          (R$ 199,90). Empresas têm desconto via folhas (até 58%).
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
  icone,
  cor,
  planos,
}: {
  categoria: string;
  icone: React.ReactNode;
  cor: string;
  planos: Plano[];
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <span
          className={`size-10 rounded-md flex items-center justify-center ${cor}`}
        >
          {icone}
        </span>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-cocoa">
          {categoria}
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
        {planos.map((p) => (
          <PlanCard
            key={p.id}
            plano={p}
            inclui={RESUMO_INCLUI[p.id] ?? []}
          />
        ))}
      </div>
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
            Pacotes Manada — para empresas que consultam volume.
          </h2>
          <p className="mt-3 text-tabaco">
            Compre folhas (créditos) antecipadas e consuma conforme uso.
            Quanto maior o pacote, maior o bônus. Sem mensalidade.
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
                <span className="text-tabaco">folhas</span>
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
          Como cada plano consome folhas
        </h3>
        <p className="text-sm text-tabaco mb-6">
          Empresas pagam o mesmo conteúdo dos planos avulsos B2C com até 40%
          menos. Aqui está a equivalência:
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
              A partir de 4.500 folhas/mês temos planos sob medida com SLA,
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
            <th className="text-right font-mono font-medium py-2">Folhas</th>
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
