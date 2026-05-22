import Link from "next/link";

export function PostLGPDFinalidade() {
  return (
    <>
      <p className="lead">
        Toda consulta de CPF, CNPJ ou veicular exige uma <strong>finalidade declarada</strong>
        — não é burocracia, é exigência da LGPD (Art. 7º). Sem a finalidade certa, sua
        consulta pode virar problema jurídico. Veja o que aceitar e o que evitar.
      </p>

      <h2>O que a LGPD diz sobre consultar dados de terceiros</h2>
      <p>
        A Lei Geral de Proteção de Dados regula <strong>todo tratamento de dado pessoal</strong>,
        e consulta a bureaus de crédito é tratamento. O Art. 7º exige uma das 10 bases legais:
        consentimento, cumprimento de obrigação legal, legítimo interesse, proteção de crédito etc.
      </p>
      <p>
        Pra uso comercial — análise de crédito, locação, contratação, due diligence —
        a base legal mais comum é <strong>legítimo interesse</strong> (Art. 7º, IX). Não
        precisa de consentimento explícito do titular, mas precisa de finalidade clara e
        proporcionalidade.
      </p>

      <h2>Finalidades aceitas pela Capivara</h2>
      <ul>
        <li><strong>Análise de crédito</strong> — venda a prazo, crediário, financiamento</li>
        <li><strong>Análise de inquilino</strong> — locação residencial ou comercial</li>
        <li><strong>Contratação / RH</strong> — background check pré-admissão</li>
        <li><strong>Prevenção a fraude</strong> — KYC, AML, antifraude transacional</li>
        <li><strong>Due diligence</strong> — M&A, parceria comercial, fornecedor</li>
        <li><strong>Compliance / KYC</strong> — obrigação regulatória de instituição financeira</li>
        <li><strong>Outra</strong> — descreva (mínimo 5 caracteres pra log)</li>
      </ul>

      <h2>O que NÃO é finalidade legítima</h2>
      <ul>
        <li>"Quero saber por curiosidade" — viola minimização (Art. 6º, III)</li>
        <li>"Stalker" / verificar ex-namorado — uso pessoal não comercial</li>
        <li>"Cliente prospecto sem contato anterior" — base legal frágil</li>
        <li>"Análise demográfica" — exige consentimento ou anonimização</li>
      </ul>

      <h2>O que a gente faz pra te proteger</h2>
      <p>
        Toda consulta na Capivara registra: <strong>quem consultou, quando, qual finalidade
        declarada e qual IP/User-Agent</strong>. Esses dados ficam logados por 5 anos
        (prazo de prescrição administrativa LGPD). Se a ANPD pedir auditoria, você tem
        a documentação completa.
      </p>
      <p>
        Os dados retornados ficam acessíveis por <strong>90 dias</strong>. Após isso,
        anonimizamos automaticamente: o relatório vira marcador histórico
        (ID do quem consultou + quando) sem mais conter o conteúdo. Você cumpre o
        direito ao esquecimento sem precisar lembrar de deletar.
      </p>

      <h2>Quando o titular pede pra você explicar</h2>
      <p>
        Se a pessoa consultada pedir explicação (direito de acesso, Art. 18, II),
        você precisa mostrar:
      </p>
      <ul>
        <li>Quando consultou</li>
        <li>Qual a finalidade declarada</li>
        <li>Qual a base legal aplicada</li>
        <li>Quanto tempo guardou os dados</li>
        <li>Pra quem compartilhou (se aplicável)</li>
      </ul>
      <p>
        A Capivara já gera essa documentação pra você — basta exportar o PDF do
        relatório, que tem todos esses campos no rodapé.
      </p>

      <h2>Resumindo</h2>
      <p>
        Consulta de CPF/CNPJ/veicular é legal e segura quando você tem uma finalidade
        comercial legítima. A Capivara força você a declarar isso a cada consulta e
        guarda a documentação pra qualquer auditoria futura. Veja <Link href="/lgpd">nossa política completa</Link> ou comece com a{" "}
        <Link href="/consultar/cpf">consulta CPF</Link> a partir de R$ 9,90.
      </p>
    </>
  );
}
