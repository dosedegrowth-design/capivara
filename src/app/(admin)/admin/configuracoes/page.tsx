import { EmConstrucao } from "@/components/capivara/em-construcao";

export default function Page() {
  return <EmConstrucao
    area="Configurações"
    descricao="Preços, cupons, feature flags e parâmetros gerais."
    voltarHref="/admin"
    voltarLabel="Voltar pra visão geral"
  />;
}
