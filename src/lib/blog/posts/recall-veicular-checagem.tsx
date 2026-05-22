import Link from "next/link";

export function PostRecallVeicular() {
  return (
    <>
      <p className="lead">
        Recall do fabricante existe pra trocar peça com defeito de série. Tem
        carro com recall <strong>aberto há 8 anos</strong> rodando. Antes de
        comprar usado, sempre checa.
      </p>

      <h2>O que é recall</h2>
      <p>
        Quando a montadora descobre que um lote saiu de fábrica com defeito
        (geralmente em segurança — freio, airbag, combustível), ela é obrigada
        a chamar os donos pra trocar a peça <strong>gratuitamente</strong>. Isso
        é recall.
      </p>
      <p>
        O fabricante deveria entrar em contato com cada proprietário, mas com
        a quantidade de transferências no Brasil, a informação se perde.
        Resultado: <strong>cerca de 40% dos recalls no Brasil ficam não atendidos</strong>{" "}
        — peça defeituosa segue rodando.
      </p>

      <h2>Por que importa antes de comprar</h2>
      <ul>
        <li>
          <strong>Segurança</strong> — recalls cobrem peças críticas: airbag (Takata),
          freio (Toyota 2019), combustível (Honda 2017). Andar com recall aberto
          é arriscar a vida.
        </li>
        <li>
          <strong>Valor</strong> — carro com recall aberto vale menos. Argumento de
          negociação ou motivo pra recusar a compra.
        </li>
        <li>
          <strong>Trabalho</strong> — depois de comprar, você é quem vai ter que
          marcar concessionária, deixar o carro, ir buscar. Pode ser 1-2 semanas.
        </li>
        <li>
          <strong>Seguradora</strong> — se acontecer sinistro relacionado à peça
          do recall não atendido, a seguradora pode recusar a indenização.
        </li>
      </ul>

      <h2>Recalls mais famosos no Brasil</h2>
      <ul>
        <li><strong>Airbag Takata (2014-2020)</strong> — 6 milhões de veículos afetados. Várias marcas (Honda, Toyota, BMW, Audi etc).</li>
        <li><strong>Sistema de combustível Fiat (2018)</strong> — risco de incêndio.</li>
        <li><strong>Freios Toyota Corolla (2019)</strong> — perda de eficiência em chuva.</li>
        <li><strong>Bateria de híbridos/elétricos (2022-2024)</strong> — risco térmico.</li>
      </ul>

      <h2>Como verificar antes de comprar</h2>
      <ol>
        <li>
          <strong>Peça a placa do veículo</strong> antes de fechar a compra.
        </li>
        <li>
          <strong>Consulte com plano Veicular Premium (R$ 89,90)</strong> ou superior —
          inclui status de recall pendente no fabricante.
        </li>
        <li>
          <strong>Se tiver recall aberto</strong>, peça pro vendedor levar pra
          concessionária resolver antes da venda OU desconta o valor + prazo do
          trabalho do preço.
        </li>
        <li>
          <strong>Você mesmo pode resolver depois</strong> — recall é grátis pra qualquer
          dono atual, não importa se você comprou usado.
        </li>
      </ol>

      <h2>O recall some quando faz?</h2>
      <p>
        Sim. Quando o serviço é feito na concessionária autorizada, ela registra
        no sistema do Denatran. O carro passa a constar como "recall atendido"
        em qualquer consulta futura.
      </p>

      <h2>Resumindo</h2>
      <p>
        Recall aberto = peça defeituosa em circulação. Verifique antes de comprar usado
        e use como argumento de negociação. <Link href="/consultar/veicular">Veja a consulta
        veicular</Link> da Capivara — Premium e Total trazem status de recall.
      </p>
    </>
  );
}
