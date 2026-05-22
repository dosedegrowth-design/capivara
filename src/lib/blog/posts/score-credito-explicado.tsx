import Link from "next/link";

export function PostScoreCredito() {
  return (
    <>
      <p className="lead">
        Score 0 a 1000. Mas o que cada faixa significa, como é calculado e por que
        a mesma pessoa pode ter scores diferentes em Serasa e Boa Vista no mesmo dia?
      </p>

      <h2>O que é score de crédito</h2>
      <p>
        É uma <strong>nota estatística</strong> que estima a probabilidade de uma pessoa
        pagar suas contas em dia nos próximos 6-12 meses. Quanto maior o score, menor
        o risco percebido pelo sistema financeiro.
      </p>
      <p>
        A nota vai de 0 a 1000 e considera: histórico de pagamento, dívidas em aberto,
        consultas recentes, vínculos empresariais, padrão de uso de crédito (CDC,
        cheque especial, cartão), renda presumida e tempo de relacionamento bancário.
      </p>

      <h2>Faixas e o que significam</h2>
      <ul>
        <li><strong>0–300 (Muito alto risco)</strong> — chance grande de inadimplir. Negue venda a prazo ou peça entrada significativa + fiador.</li>
        <li><strong>301–500 (Alto risco)</strong> — atenção. Aprove com limite reduzido, parcelas curtas e/ou garantia.</li>
        <li><strong>501–700 (Risco moderado)</strong> — perfil mediano. Aprove conforme política, com limites convencionais.</li>
        <li><strong>701–900 (Bom pagador)</strong> — confiável. Aprove limites cheios, taxas menores.</li>
        <li><strong>901–1000 (Excelente)</strong> — top 5%. Cliente premium, ofertas diferenciadas.</li>
      </ul>

      <h2>Por que Serasa e Boa Vista têm scores diferentes</h2>
      <p>
        Cada bureau tem <strong>modelo estatístico próprio</strong>, dados próprios
        e clientes próprios. Serasa tem mais cobertura em São Paulo e Sudeste, Boa Vista
        em Centro-Oeste e Norte. SPC (CDL) tem cobertura específica do varejo.
      </p>
      <p>
        Por isso a Capivara mostra <strong>os dois scores juntos</strong> (a partir do
        plano Avançada). Se ambos forem altos = sinal verde claro. Se um for alto e
        outro baixo = vale investigar antes de fechar.
      </p>

      <h2>O que mais afeta o score</h2>
      <ul>
        <li><strong>Pagamento em dia</strong> — fator #1, peso 35%+</li>
        <li><strong>Dívidas ativas</strong> — quanto deve hoje vs. renda presumida</li>
        <li><strong>Tempo de histórico</strong> — quanto mais antigo o CPF, melhor</li>
        <li><strong>Consultas recentes</strong> — muitas consultas em pouco tempo = sinal de alarme (procurando crédito desesperadamente)</li>
        <li><strong>Diversidade</strong> — usa só cartão? Só CDC? Mix aumenta score</li>
        <li><strong>Vínculos empresariais</strong> — sócio em empresa ativa ajuda</li>
      </ul>

      <h2>Score baixo: temporário ou permanente?</h2>
      <p>
        Quase tudo no score é <strong>recuperável em 6-24 meses</strong>:
      </p>
      <ul>
        <li>Quitar dívida vencida → +50 a +120 pontos em 30-60 dias</li>
        <li>Pagar fatura em dia 6 meses seguidos → +30 a +80 pontos</li>
        <li>Cadastro positivo ativo (autorizar Serasa a olhar) → +50 a +100 pontos imediatos</li>
        <li>Tempo (só esperar protesto sumir) → 5 anos pra protesto antigo cair</li>
      </ul>

      <h2>Use score, mas não só score</h2>
      <p>
        Score é resumo estatístico. Pra decisão fundamentada, combine com:
      </p>
      <ul>
        <li><strong>Dívidas detalhadas</strong> — quanto, com quem, há quanto tempo</li>
        <li><strong>Protestos</strong> — cartórios mostram inadimplência grave</li>
        <li><strong>Cheques sem fundo</strong> — sinal de gestão financeira ruim</li>
        <li><strong>Ações trabalhistas</strong> — relevante pra contratação</li>
      </ul>
      <p>
        Tudo isso vem nos planos <Link href="/consultar/cpf">Avançada e Premium</Link> da
        Capivara. PDF em segundos, a partir de R$ 39,90.
      </p>
    </>
  );
}
