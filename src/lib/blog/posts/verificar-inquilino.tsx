import Link from "next/link";

export function PostInquilino() {
  return (
    <>
      <p className="lead">
        Cada locação tem entre 12 e 36 meses de contrato. Um inquilino
        inadimplente significa meses de prejuízo, ação judicial cara e desgaste.
        Imobiliárias profissionais fazem checagem antes. Você também pode.
      </p>

      <h2>1. Confirmação de identidade</h2>
      <p>
        Comece pela <strong>consulta básica do CPF</strong>: confirma se a
        pessoa existe, qual a situação cadastral na Receita Federal e qual
        o nome completo declarado. Vendedor de imóvel duvidoso costuma
        pedir RG falso — checar o CPF é a primeira camada de segurança.
      </p>

      <h2>2. Análise de score de crédito</h2>
      <p>
        Score abaixo de 300 indica alto risco de inadimplência nos próximos
        12 meses. Score acima de 700 é considerado bom pagador. Cada bureau
        (Serasa, Boa Vista) tem método próprio — vale cruzar.
      </p>

      <h2>3. Dívidas em aberto</h2>
      <p>
        Mesmo com score razoável, o que conta é se há <strong>dívidas
        ativas no nome</strong> hoje. Pendência em loja de R$ 500 não é
        impeditivo. Várias pendências somando R$ 5.000+ acende alerta.
      </p>

      <h2>4. Certidão Trabalhista (CNDT)</h2>
      <p>
        Indica se a pessoa tem ações trabalhistas como ré, o que pode
        significar que o salário está comprometido com pagamentos judiciais
        (e o dinheiro do aluguel pode não chegar).
      </p>

      <h2>5. Histórico de endereços</h2>
      <p>
        Quantas vezes a pessoa mudou de endereço nos últimos anos? Mudanças
        muito frequentes podem indicar dificuldade em manter contratos
        de locação anteriores.
      </p>

      <h2>6. Renda compatível</h2>
      <p>
        A regra clássica é o aluguel não passar de 30% da renda mensal.
        Se a pessoa declara R$ 4.000 e quer alugar imóvel de R$ 2.500,
        há sinal de alerta. Vale pedir contracheque ou DECORE.
      </p>

      <h2>Finalidade LGPD</h2>
      <p>
        Toda consulta a dado de terceiro precisa ter <strong>finalidade
        legítima</strong>. Para locação imobiliária, a finalidade é
        "verificação para locação" — base legal prevista na própria
        lei (art. 7º, II e VI).
      </p>
      <p>
        Recomendado pedir consentimento explícito do candidato no
        formulário de interesse, deixando claro que faremos a verificação.
        Boa prática mantém você dentro da lei e cria confiança.
      </p>

      <h2>O combo recomendado</h2>
      <p>
        Para uma análise completa de inquilino, o pacote{" "}
        <Link href="/precos">CPF Avançada</Link> (R$ 39,90) cobre:
      </p>
      <ul>
        <li>Dados cadastrais completos</li>
        <li>Score Boa Vista</li>
        <li>Pendências financeiras</li>
        <li>Protestos e histórico</li>
        <li>Endereços e telefones</li>
      </ul>
      <p>
        Para casos críticos (imóveis de R$ 5.000+/mês), considere o{" "}
        <Link href="/precos">Raio-X</Link> (R$ 129,90) que adiciona SCR
        BACEN e SPC Brasil ao relatório.
      </p>

      <h2>Resumo prático</h2>
      <ol>
        <li>Peça nome completo + CPF do candidato no formulário</li>
        <li>Inclua autorização de consulta no termo de interesse</li>
        <li>Faça a verificação antes da visita</li>
        <li>Salve o PDF como prova da diligência feita</li>
        <li>Decida com base em dado, não em intuição</li>
      </ol>

      <p>
        <Link href="/consultar/cpf">
          Verificar um candidato agora
        </Link>{" "}
        leva menos de um minuto.
      </p>
    </>
  );
}
