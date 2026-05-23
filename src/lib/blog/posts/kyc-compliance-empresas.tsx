import Link from "next/link";

export function PostKYCCompliance() {
  return (
    <>
      <p className="lead">
        Empresa que vende a prazo, faz parceria comercial ou trabalha com
        fintech precisa de KYC (Know Your Customer). Veja o que isso significa
        na prática brasileira e como implementar sem advogado caro.
      </p>

      <h2>O que é KYC</h2>
      <p>
        KYC é o processo de <strong>conhecer com quem você está fazendo
        negócio</strong>. Verificar identidade, vínculos, histórico financeiro
        e indicadores de risco antes de fechar transação relevante. Surgiu no
        sistema bancário internacional pra prevenir lavagem de dinheiro (AML)
        e financiamento ao terrorismo, mas hoje vale pra qualquer negócio que
        carregue risco de fraude.
      </p>

      <h2>Quem é obrigado a fazer KYC no Brasil</h2>
      <p>
        A obrigação formal vem de várias leis e resoluções:
      </p>
      <ul>
        <li><strong>Lei 9.613/1998 (Lei de Lavagem)</strong> — instituições financeiras, seguradoras, factorings, corretoras imobiliárias, joalherias, dealers de luxo</li>
        <li><strong>Resolução COAF 36/2021</strong> — pessoas jurídicas que negociam imóveis, joias, obras de arte, bens de luxo</li>
        <li><strong>Resolução BCB 119/2021</strong> — IPs (Instituições de Pagamento), fintechs, gateways</li>
        <li><strong>Lei 12.846/2013 (Anticorrupção)</strong> — empresas que lidam com poder público</li>
      </ul>
      <p>
        Pra quem não é obrigado por lei, KYC ainda é{" "}
        <strong>boa prática comercial</strong> — reduz inadimplência,
        fraude e responsabilidade solidária.
      </p>

      <h2>O que verificar (checklist KYC básico)</h2>

      <h3>Para pessoa física (CPF)</h3>
      <ul>
        <li>Confirmação de identidade na Receita Federal</li>
        <li>Endereço atual e histórico</li>
        <li>Score de crédito (Serasa, Boa Vista)</li>
        <li>Dívidas em aberto</li>
        <li>Protestos cartorários</li>
        <li>Ações judiciais relevantes</li>
        <li>Vínculos empresariais (é sócio em alguma PJ?)</li>
        <li>Listas de sanções (PEP — Pessoa Exposta Politicamente — quando aplicável)</li>
      </ul>

      <h3>Para pessoa jurídica (CNPJ)</h3>
      <ul>
        <li>Situação cadastral na Receita</li>
        <li>Quadro de sócios completo</li>
        <li>CPF dos sócios (KYC de cada um)</li>
        <li>Certidões fiscais (federal, estadual, municipal)</li>
        <li>Certidão trabalhista (TST)</li>
        <li>Score empresarial</li>
        <li>Histórico de processos cíveis</li>
        <li>Endereço operacional confirmado</li>
        <li>Empresas do mesmo grupo (red flag se houver pulverização)</li>
      </ul>

      <h2>KYC simplificado vs ampliado</h2>
      <p>
        Resoluções modernas (BCB 119, COAF 36) permitem{" "}
        <strong>KYC proporcional ao risco</strong>:
      </p>
      <ul>
        <li><strong>Simplificado</strong> — operações de baixo valor com cliente já conhecido. Confirmação de CPF + endereço bastam.</li>
        <li><strong>Padrão</strong> — operações de valor moderado. Inclui score, dívidas, vínculos.</li>
        <li><strong>Ampliado</strong> — operações de alto valor, PEPs, cliente estrangeiro. Inclui due diligence completa, declaração de origem dos recursos, verificação de sanções internacionais.</li>
      </ul>

      <h2>Como a Capivara ajuda</h2>
      <p>
        A Capivara não substitui um sistema KYC corporativo completo (com
        workflow de aprovação, ML antifraude, monitoramento contínuo), mas{" "}
        <strong>cobre a camada de coleta de dados</strong>:
      </p>
      <ul>
        <li><strong>CPF Investigação (R$ 19,90)</strong> — KYC simplificado pra venda a prazo, locação, pequeno crediário</li>
        <li><strong>CPF Premium (R$ 89,90)</strong> — KYC padrão pra contratação, parceria, crédito médio</li>
        <li><strong>CPF Raio-X (R$ 199)</strong> — KYC ampliado com SCR Bacen + score de fraude + análise comportamental</li>
        <li><strong>CNPJ Total (R$ 199)</strong> — Due diligence empresarial completa</li>
      </ul>
      <p>
        Todo aceite, finalidade declarada e consulta fica em log auditável por
        5 anos (LGPD Art. 37), disponível pra apresentar à ANPD, COAF ou BCB
        em caso de auditoria.
      </p>

      <h2>Erros comuns</h2>
      <ul>
        <li><strong>Coletar mais do que precisa</strong> — KYC ampliado pra venda de R$ 200 viola minimização (LGPD Art. 6º III)</li>
        <li><strong>Não declarar finalidade</strong> — toda consulta exige finalidade legítima documentada</li>
        <li><strong>Guardar pra sempre</strong> — defina prazos de retenção (LGPD Art. 16). Capivara retém 90 dias por padrão.</li>
        <li><strong>Compartilhar dados sem base legal</strong> — KYC interno não autoriza repasse a terceiros</li>
      </ul>

      <h2>Próximo passo</h2>
      <p>
        Pra entender qual plano cobre seu caso, veja{" "}
        <Link href="/casos-de-uso" className="text-fur hover:underline">os casos de uso</Link>{" "}
        ou comece pela <Link href="/consultar/cpf" className="text-fur hover:underline">consulta CPF</Link>.
      </p>
    </>
  );
}
