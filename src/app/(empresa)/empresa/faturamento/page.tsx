import { EmConstrucao } from "@/components/capivara/em-construcao";

export default function Page() {
  return <EmConstrucao
    area="Faturamento"
    descricao="Histórico de recargas, NF-e emitidas e configurações fiscais."
    voltarHref="/empresa"
    voltarLabel="Voltar pro painel"
  />;
}
