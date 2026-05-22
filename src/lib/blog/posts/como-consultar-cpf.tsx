import Link from "next/link";

export function PostComoConsultarCPF() {
  return (
    <>
      <p className="lead">
        Quando você precisa <strong>verificar uma pessoa antes de fazer
        negócio</strong> (alugar imóvel, conceder crédito, contratar funcionário),
        a primeira pergunta é: qual base consultar? Serasa? SPC? Boa Vista? E
        o que cada uma mostra de verdade?
      </p>

      <p>
        Este guia explica de forma direta o que cada base de dados oficial de
        crédito mostra, quando vale a pena cruzar várias e por que combinar
        ajuda a evitar surpresas.
      </p>

      <h2>O que são bureaus de crédito?</h2>
      <p>
        São empresas autorizadas pelo Banco Central que coletam, organizam e
        disponibilizam informações financeiras de pessoas físicas e jurídicas.
        No Brasil, os principais são <strong>Serasa</strong>, <strong>SPC
        Brasil</strong>, <strong>Boa Vista</strong> e <strong>QUOD</strong>.
        Cada um tem critérios próprios para calcular o score de crédito.
      </p>

      <h2>Diferenças entre as principais bases</h2>
      <h3>Serasa Premium</h3>
      <p>
        Considerada a base mais completa do mercado. Inclui dados cadastrais,
        score Serasa, dívidas em aberto, protestos cartoriais, cheques sem fundos,
        cheques sustados e dados do Cenprot.
      </p>

      <h3>SPC Brasil</h3>
      <p>
        Banco de dados administrado pela Confederação Nacional de Dirigentes
        Lojistas (CNDL). Cobre principalmente dívidas comerciais (compras
        parceladas, financiamentos). Tem dados de pendências, ações cíveis
        e cheques sem fundo.
      </p>

      <h3>Boa Vista</h3>
      <p>
        Score Boa Vista (anteriormente SCPC) com foco em previsão de
        inadimplência nos próximos 12 meses. Inclui dados cadastrais e
        pendências financeiras consolidadas.
      </p>

      <h3>SCR BACEN</h3>
      <p>
        O Sistema de Informações de Crédito do Banco Central é onde estão
        registradas todas as operações de crédito acima de R$ 200 (cartão,
        empréstimo, financiamento, cheque especial). Mostra o quanto a pessoa
        tem comprometido com bancos no momento.
      </p>

      <h3>QUOD</h3>
      <p>
        Bureau positivo criado pelos cinco maiores bancos do país. Foca em
        histórico de bom pagador (cadastro positivo) além das pendências.
      </p>

      <h2>Por que cruzar várias bases?</h2>
      <p>
        Cada bureau tem origens de dados diferentes. Uma pessoa pode estar
        limpa no Serasa mas ter pendência no SPC. Outra pode ter ótimo score
        Boa Vista, mas operações de crédito altas no SCR BACEN indicando
        super-endividamento.
      </p>

      <p>
        <strong>Combinar 3-4 bases dá uma visão muito mais honesta</strong> do
        que apenas uma. É exatamente isso que o plano{" "}
        <Link href="/precos">Raio-X da Capivara</Link> entrega: Serasa Premium,
        SPC, Boa Vista e SCR BACEN no mesmo relatório.
      </p>

      <h2>O que mais vale a pena olhar</h2>
      <p>Além de score e dívidas, costuma valer a pena conferir:</p>
      <ul>
        <li><strong>Certidão Negativa de Débitos Trabalhistas (CNDT)</strong>: se a pessoa tem dívida judicial trabalhista</li>
        <li><strong>Endereços históricos</strong>: confirmar se reside realmente onde diz residir</li>
        <li><strong>Empresas vinculadas</strong>: se figura como sócio, qual situação dessas empresas</li>
        <li><strong>Veículos e imóveis</strong>: ativos que podem ser usados como garantia</li>
      </ul>

      <h2>E a LGPD?</h2>
      <p>
        Toda consulta a dado de terceiro precisa ter <strong>finalidade
        legítima declarada</strong> (análise de crédito, locação, RH, etc).
        A Capivara registra IP, horário e finalidade de toda consulta,
        gerando trilha auditável caso o titular pergunte.
      </p>

      <h2>Conclusão</h2>
      <p>
        Para uma decisão informada, não consulte uma base apenas — combine
        2-3. O custo extra (poucos reais) compensa muito o prejuízo de uma
        decisão errada de crédito, contratação ou locação.
      </p>

      <p>
        <Link href="/consultar/cpf">
          Comece pela Espiadinha (R$ 9,90) ou vá direto pro Raio-X
        </Link>{" "}
        se quiser o relatório consolidado.
      </p>
    </>
  );
}
