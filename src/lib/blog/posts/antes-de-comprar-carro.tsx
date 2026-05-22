import Link from "next/link";

export function PostAntesDeComprarCarro() {
  return (
    <>
      <p className="lead">
        Comprar carro usado sem fazer as verificações certas é receita pra
        prejuízo. Carro batido, financiado, com multas absurdas ou de leilão
        sem informar. Esse guia lista as 8 verificações essenciais antes de
        fechar negócio.
      </p>

      <h2>1. Gravame (alienação fiduciária)</h2>
      <p>
        É o primeiro item a checar. Mostra se o carro está financiado e
        ainda tem dívida com banco. Quem dirige um carro com gravame ativo
        não consegue transferir pra seu nome até quitar com a financeira.
      </p>
      <p>
        Vendedor que insiste em "tudo certo, pode passar pro seu nome" mas
        tem gravame ativo está mentindo. Verifique sempre.
      </p>

      <h2>2. Histórico de leilão</h2>
      <p>
        Carros que passaram por leilão (seguradora, judicial ou administrativo)
        têm valor de mercado bem menor. Vendedor que esconde isso está
        praticando má-fé.
      </p>
      <p>
        Categorias comuns: <strong>indenizado por sinistro grave</strong>,
        <strong> leilão judicial</strong>, <strong>roubo recuperado</strong>.
        Cada uma exige cuidados específicos.
      </p>

      <h2>3. RENAJUD (restrições judiciais)</h2>
      <p>
        Sistema do Conselho Nacional de Justiça que registra bloqueios
        judiciais sobre veículos (penhora, indisponibilidade). Carro com
        RENAJUD ativo não pode ser vendido até o juiz liberar.
      </p>

      <h2>4. Recall ativo do fabricante</h2>
      <p>
        Muitos modelos tem campanhas de recall obrigatórias (airbag,
        sistema de freios). Se o recall não foi atendido, o problema continua.
        Vale a pena verificar e exigir que o vendedor leve à concessionária
        antes de fechar.
      </p>

      <h2>5. Histórico de roubo e furto</h2>
      <p>
        Carro com BO de roubo ou furto ativo nas bases policiais não pode
        ser transferido. Mesmo se já foi recuperado, ter passado por roubo
        impacta o valor (e algumas seguradoras se recusam a cobrir).
      </p>

      <h2>6. Multas e infrações (RENAINF)</h2>
      <p>
        Multas em aberto ficam vinculadas ao veículo. Se você transferir
        pro seu nome sem quitar, vira sua dívida. Algumas multas significam
        suspensão de CNH.
      </p>

      <h2>7. Originalidade (chassi e motor)</h2>
      <p>
        Confirme que os números de chassi, motor e câmbio batem com o
        documento. Adulteração de chassi torna o carro inapreensível e
        sujeito a apreensão pela polícia.
      </p>

      <h2>8. CRLV em dia</h2>
      <p>
        O Certificado de Registro e Licenciamento do Veículo precisa estar
        em dia (IPVA pago, vistoria feita). Carro com CRLV vencido não
        pode circular legalmente.
      </p>

      <h2>Como fazer tudo de uma vez</h2>
      <p>
        Em vez de consultar cada coisa separadamente, o{" "}
        <Link href="/precos">plano Veicular Premium da Capivara</Link>{" "}
        retorna tudo isso (e mais BIN Estadual, Certificado de Segurança e
        Vip Car) em um PDF único. R$ 119,90 para evitar prejuízos que podem
        chegar a dezenas de milhares.
      </p>

      <h2>Bônus: foto do leilão</h2>
      <p>
        Quando o carro passou por leilão, conseguimos puxar as fotos
        registradas no momento do leilão. Isso revela danos estruturais
        que podem ter sido encobertos pela funilaria recente.
      </p>

      <p>
        <Link href="/consultar/veicular">
          Verificar um carro agora
        </Link>{" "}
        leva menos de um minuto.
      </p>
    </>
  );
}
