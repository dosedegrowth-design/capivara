import { EmConstrucao } from "@/components/capivara/em-construcao";

export default function Page() {
  return <EmConstrucao
    area="Webhooks"
    descricao="Configure URLs pra receber notificações em tempo real (consulta concluída, saldo baixo)."
    voltarHref="/empresa"
    voltarLabel="Voltar pro painel"
  />;
}
