import { EmConstrucao } from "@/components/capivara/em-construcao";

export default function Page() {
  return <EmConstrucao
    area="Financeiro"
    descricao="DRE, transações, reconciliação Asaas, custos API Full."
    voltarHref="/admin"
    voltarLabel="Voltar pra visão geral"
  />;
}
