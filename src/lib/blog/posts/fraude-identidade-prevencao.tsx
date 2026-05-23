import Link from "next/link";

export function PostFraudeIdentidade() {
  return (
    <>
      <p className="lead">
        Fraude de identidade subiu 38% no Brasil em 2025 segundo a Serasa
        Experian. Documento falso, CPF clonado, conta laranja — veja como
        identificar antes de fechar negócio.
      </p>

      <h2>O que é fraude de identidade</h2>
      <p>
        É quando alguém usa <strong>dados pessoais alheios</strong> (CPF,
        RG, CNH) pra:
      </p>
      <ul>
        <li>Abrir conta bancária ou linha de crédito em nome da vítima</li>
        <li>Fazer compras a prazo que não vai pagar</li>
        <li>Alugar imóvel pra atividade ilegal</li>
        <li>Comprar carro com financiamento que vai cair na vítima</li>
        <li>Abrir empresa fantasma usando o CPF de "laranja"</li>
      </ul>

      <h2>Sinais de alerta numa consulta CPF</h2>

      <h3>1. Dados inconsistentes</h3>
      <p>
        Nome no documento não bate com nome na Receita. Mãe não confere.
        Data de nascimento alterada. Endereço atual em outra cidade. Tudo
        isso pode ser fraude — ou pode ser só erro cadastral. Pergunte.
      </p>

      <h3>2. Histórico recente demais</h3>
      <p>
        CPF aberto há menos de 6 meses solicitando crédito alto = red flag.
        Fraudadores criam "perfis sintéticos" combinando dados reais e
        falsos, geram CPF novo e usam por alguns meses antes da quebra.
      </p>

      <h3>3. Endereços em conflito</h3>
      <p>
        Pessoa diz morar em SP mas tem 5 endereços no histórico, todos em
        bairros diferentes do Brasil. Padrão de fraude "rotativa".
      </p>

      <h3>4. Score muito baixo súbito</h3>
      <p>
        Score caiu de 700 pra 200 em 3 meses sem contexto. Pode ser CPF
        clonado já usado por terceiros.
      </p>

      <h3>5. Vínculos empresariais inexistentes</h3>
      <p>
        Pessoa se apresenta como "dono da empresa X" mas o CPF não aparece
        como sócio nem administrador em lugar nenhum.
      </p>

      <h3>6. Múltiplas consultas recentes</h3>
      <p>
        Bureaus mostram quantas vezes o CPF foi consultado nos últimos 90
        dias. 20+ consultas = alguém tentando crédito em vários lugares
        simultaneamente. Pode ser fraudador testando antes que a primeira
        seja descoberta.
      </p>

      <h2>Sinais de alerta numa consulta CNPJ</h2>

      <h3>1. Empresa aberta há &lt; 6 meses</h3>
      <p>
        Fraude empresarial usa "empresas de fachada" abertas pra durar
        meses. Operação aberta há &lt; 6 meses pedindo contrato grande =
        suspeito.
      </p>

      <h3>2. Endereço de coworking compartilhado</h3>
      <p>
        100 empresas no mesmo endereço, todas CNAEs diferentes. Quase
        sempre são "empresas de fachada" ou estrutura agressiva de
        sonegação fiscal.
      </p>

      <h3>3. CNAE não bate com atividade</h3>
      <p>
        Vende serviço de TI mas CNAE é "comércio de roupas". Pode ser
        descuido no cadastro — ou pode ser empresa "reciclada" (fraudador
        compra uma PJ inativa e usa pra outra atividade pra ter histórico
        antigo).
      </p>

      <h3>4. Sócio com restrição pesada</h3>
      <p>
        Sócio principal com Serasa score 0, protestos, ações trabalhistas
        e cíveis em massa. Vai cobrar a empresa? Bom, é provável que o
        sócio responda só com o patrimônio da empresa (que pode ser zero).
      </p>

      <h3>5. Pulverização de empresas no nome do sócio</h3>
      <p>
        Sócio aparece como admin/sócio em 8+ empresas com CNAEs diferentes,
        todas abertas em janelas curtas. Padrão clássico de estrutura
        evasiva.
      </p>

      <h2>Sinais de alerta numa consulta veicular</h2>

      <h3>1. Múltiplas transferências em pouco tempo</h3>
      <p>
        Carro trocou de dono 6 vezes em 2 anos. Pode ser ladrão lavando o
        veículo (passa pelo nome de várias pessoas pra dificultar o
        rastreio).
      </p>

      <h3>2. Carro de leilão "limpo"</h3>
      <p>
        Histórico mostra leilão recente. Vendedor jura que é "carro de
        leilão limpo" (sem batida grave). Pode ser, mas confira a
        avaliação técnica e descontou pelo menos 30% do FIPE.
      </p>

      <h3>3. KM regrediu</h3>
      <p>
        Histórico de odômetro mostra 80.000 km em 2024 e 40.000 km em
        2025. Adulteração óbvia.
      </p>

      <h3>4. Placa quente</h3>
      <p>
        Placa com restrição administrativa, judicial ou de furto. Carro
        nessa situação é praticamente impossível de transferir.
      </p>

      <h2>O que fazer se suspeitar</h2>
      <ol>
        <li><strong>Não feche o negócio na hora.</strong> Diga que precisa "consultar internamente" e ganhe tempo.</li>
        <li><strong>Confirme dados em fonte oficial.</strong> Receita Federal pra CPF/CNPJ, Detran pra placa, cartório pra protestos.</li>
        <li><strong>Peça documentos físicos.</strong> Selfie segurando RG, foto da CNH, comprovante de endereço &lt; 90 dias.</li>
        <li><strong>Se for fraude clara</strong> — denuncie na delegacia de polícia (com o relatório Capivara como evidência).</li>
        <li><strong>Se for ambíguo</strong> — recuse o negócio sem confronto direto. "Não vai dar" é resposta suficiente.</li>
      </ol>

      <h2>Mitigando do seu lado</h2>
      <p>
        Pra quem é alvo (e não fraudador), bom comportamento ajuda:
      </p>
      <ul>
        <li><strong>Cadastro positivo Serasa</strong> — autoriza ver bom histórico, sobe score</li>
        <li><strong>Bloqueio de consulta</strong> — você pode bloquear consultas indevidas no Serasa/Boa Vista quando não está procurando crédito</li>
        <li><strong>Boletim de ocorrência</strong> — se descobrir uso indevido do CPF, registre BO e anexe a contestações futuras</li>
        <li><strong>Monitoramento</strong> — bureaus oferecem alerta por SMS/email a cada nova consulta no seu CPF</li>
      </ul>

      <h2>Próximo passo</h2>
      <p>
        Antes do próximo negócio, <Link href="/consultar/cpf" className="text-fur hover:underline">puxe a capivara do CPF</Link>{" "}
        ou <Link href="/consultar/cnpj" className="text-fur hover:underline">do CNPJ</Link>.
        Espiadinha em R$ 7,90 evita prejuízo de milhares.
      </p>
    </>
  );
}
