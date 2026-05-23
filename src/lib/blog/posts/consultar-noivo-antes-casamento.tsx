import Link from "next/link";

export function PostConsultarNoivado() {
  return (
    <>
      <p className="lead">
        Casamento brasileiro envolve regime de bens, dívidas conjuntas e
        responsabilidade financeira solidária. Conhecer a vida financeira do
        parceiro antes não é desconfiança — é planejamento.
      </p>

      <h2>O que muda financeiramente quando casa</h2>
      <p>
        Depende do regime de bens escolhido:
      </p>
      <ul>
        <li><strong>Comunhão parcial</strong> (default no Brasil) — bens adquiridos durante o casamento são de ambos. Dívidas contraídas durante o casamento podem ser cobradas dos dois.</li>
        <li><strong>Comunhão universal</strong> — tudo é dos dois, antes e depois. Dívida do passado do cônjuge passa a ser sua também.</li>
        <li><strong>Separação total</strong> — cada um mantém o seu. Só vale se houver pacto antenupcial registrado.</li>
        <li><strong>Participação final nos aquestos</strong> — raro, intermediário.</li>
      </ul>

      <h2>Por que olhar o histórico financeiro antes</h2>

      <h3>1. Dívidas que viram suas</h3>
      <p>
        Em comunhão (parcial ou universal), credor pode penhorar bem conjugal
        pra cobrar dívida do cônjuge. Casa que vocês compraram juntos? Pode ir
        a leilão por dívida que ele tinha antes (universal) ou contraiu
        durante (parcial).
      </p>

      <h3>2. Score do casal</h3>
      <p>
        Pra financiar imóvel ou carro juntos, banco analisa score dos dois.
        Cônjuge com score 200 reduz limite ou aumenta taxa pra ambos.
      </p>

      <h3>3. Aval futuro</h3>
      <p>
        Em muitos contratos comerciais e bancários, cônjuge é exigido como
        avalista. Se um dos dois tem restrição grave, o outro fica preso a
        operações sem aval (limita opções).
      </p>

      <h3>4. Patrimônio escondido ou superestimado</h3>
      <p>
        Cônjuge pode ter empresas que você desconhece — e que carregam passivo
        trabalhista pesado. Ou pode ter dito que tem 3 imóveis quando na
        verdade tem 0.
      </p>

      <h3>5. Histórico de ações judiciais</h3>
      <p>
        Processos cíveis e trabalhistas envolvendo o futuro cônjuge podem
        afetar a vida conjugal — financeira e emocional. Vale saber antes,
        não depois da primeira penhora.
      </p>

      <h2>Como fazer (sem ser invasivo)</h2>
      <ol>
        <li>
          <strong>Converse abertamente sobre dinheiro.</strong> Idealmente o
          parceiro topa fazer juntos — vocês consultam o CPF um do outro com
          finalidade "due diligence pessoal".
        </li>
        <li>
          <strong>Plano CPF Avançada (R$ 39,90)</strong> dá uma visão razoável:
          score Serasa + Boa Vista, dívidas em aberto, protestos, vínculos
          empresariais.
        </li>
        <li>
          <strong>Plano CPF Premium (R$ 89,90)</strong> inclui ações
          trabalhistas e cíveis — relevante se há histórico empresarial.
        </li>
        <li>
          <strong>Combine com conversa franca.</strong> Score 400 não
          inviabiliza casamento. Esconder dívida de R$ 80k, sim.
        </li>
      </ol>

      <h2>E se descobrir algo ruim</h2>
      <p>
        Antes do casamento, dá tempo de:
      </p>
      <ul>
        <li><strong>Negociar pacto antenupcial</strong> com separação total ou parcial limitada (proteção mútua)</li>
        <li><strong>Quitar/renegociar dívidas</strong> antes da união (custa menos)</li>
        <li><strong>Planejar reserva</strong> de emergência pra absorver imprevistos</li>
        <li><strong>Decidir como vão lidar</strong> com gastos compartilhados vs individuais</li>
      </ul>

      <h2>É legal consultar o CPF do parceiro?</h2>
      <p>
        Tecnicamente, consulta de dados pessoais alheios exige base legal LGPD
        (Art. 7º). Pra parceiro:
      </p>
      <ul>
        <li><strong>Com consentimento dele(a)</strong> — base legal "consentimento" (Art. 7º I). Ideal. Ele(a) preenche o CPF junto com você no formulário.</li>
        <li><strong>Sem consentimento</strong> — base legal mais frágil, geralmente "legítimo interesse" pra proteger seu próprio patrimônio em comunhão futura. Aceitável mas com risco maior.</li>
      </ul>
      <p>
        O ideal é fazer juntos como "cuidado mútuo financeiro". Não é
        constrangedor — é boa prática.
      </p>

      <h2>O que NÃO é finalidade aceita</h2>
      <ul>
        <li><strong>Stalkear ex</strong> — não tem base legal</li>
        <li><strong>Pesquisar crush sem contato prévio</strong> — viola proporcionalidade</li>
        <li><strong>Compartilhar resultado em grupo de WhatsApp</strong> — viola minimização e pode caracterizar dano moral</li>
      </ul>

      <h2>Resumindo</h2>
      <p>
        Casamento é contrato de longo prazo com componente financeiro forte.
        Conversa franca + consulta com consentimento mútuo é melhor do que descobrir surpresa
        no primeiro Carnê Leão conjunto. Comece pela{" "}
        <Link href="/consultar/cpf" className="text-fur hover:underline">consulta CPF</Link>{" "}
        Avançada (R$ 39,90).
      </p>
    </>
  );
}
