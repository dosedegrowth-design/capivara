import Link from "next/link";

export function PostCNPJDueDiligence() {
  return (
    <>
      <p className="lead">
        Antes de assinar contrato de fornecimento, parceria comercial ou M&A, faça
        due diligence do CNPJ. Em 5 minutos você sabe se tá lidando com empresa
        sólida ou empresa de papel timbrado.
      </p>

      <h2>O que é due diligence de CNPJ</h2>
      <p>
        Due diligence (literalmente "diligência devida") é o processo de
        <strong> investigar uma empresa antes de fechar negócio</strong>.
        Inclui análise societária, fiscal, trabalhista, regulatória e financeira.
      </p>
      <p>
        Pra contratos grandes (R$ 100k+) ou parceria estratégica, vale due diligence
        completa por escritório de advocacia. Pra contratos rotineiros (fornecedor,
        parceiro pontual, venda B2B), uma consulta CNPJ Premium ou Total já cobre
        90% dos riscos.
      </p>

      <h2>O que verificar antes de assinar</h2>

      <h3>1. Empresa existe e está ativa</h3>
      <p>
        Receita Federal: situação cadastral, CNAE principal, data de abertura,
        endereço de sede. Empresa <strong>baixada, suspensa ou inapta</strong> é red flag absoluta.
      </p>

      <h3>2. Quadro de sócios</h3>
      <p>
        Quem são os sócios atuais e administradores. Capital social declarado.
        Histórico de alterações societárias (quem entrou, quem saiu, quando).
        Empresa com <strong>5 trocas de sócio em 1 ano</strong> precisa de explicação.
      </p>

      <h3>3. Certidões fiscais</h3>
      <p>
        Certidão Negativa de Débitos (CND) federal: se devem imposto, isso pode
        cair em sua mesa via responsabilidade solidária. Certidão municipal e
        estadual idem.
      </p>

      <h3>4. Certidões trabalhistas</h3>
      <p>
        Certidão Negativa de Débitos Trabalhistas (CNDT) do TST. Empresa com
        processos trabalhistas ativos pode ter passivo trabalhista oculto que
        afete sua contratação.
      </p>

      <h3>5. Score empresarial</h3>
      <p>
        Serasa e Boa Vista têm score empresarial separado do CPF dos sócios.
        Considera: tempo de mercado, faturamento estimado, histórico de pagamento
        com fornecedores, restrições no nome da empresa.
      </p>

      <h3>6. Protestos cartorários</h3>
      <p>
        Cheques sem fundo, duplicatas em cartório. Sinal claro de
        problemas de fluxo de caixa.
      </p>

      <h3>7. Empresas do mesmo grupo</h3>
      <p>
        Sócio também é admin de outras 8 empresas, todas em CNAEs diferentes?
        Pode indicar pulverização pra evitar responsabilidade. Vale checar
        as demais (consulta CNPJ adicional pra cada).
      </p>

      <h2>Sinais de alerta</h2>
      <ul>
        <li><strong>Empresa aberta há menos de 6 meses</strong> assinando contrato grande — pode ser empresa de fachada</li>
        <li><strong>Endereço de coworking</strong> (compartilhado) com 100+ outras empresas — frequente em laranjas</li>
        <li><strong>CNAE diferente da atividade declarada</strong> — vende serviço de TI mas CNAE é "comércio de roupas"</li>
        <li><strong>Sócio com restrição financeira pesada</strong> — risco de problemas pessoais virarem corporativos</li>
        <li><strong>Capital social muito baixo</strong> (R$ 1.000 pra contratar R$ 500k) — sem patrimônio pra responder</li>
        <li><strong>Histórico de baixas/abertura cíclica</strong> — fecha, abre, fecha, abre — padrão suspeito</li>
      </ul>

      <h2>Quanto vale investir em due diligence</h2>
      <p>
        Plano <strong>CNPJ Sócios (R$ 14,90)</strong> resolve fornecedor pequeno.
        Plano <strong>CNPJ Premium (R$ 49,90)</strong> cobre contratos médios.
        Plano <strong>CNPJ Total (R$ 199)</strong> faz due diligence pra contrato grande,
        com histórico de processos trabalhistas e cíveis, empresas do grupo, ações na
        junta comercial.
      </p>
      <p>
        Compare com o custo de assinar contrato errado: 1 ano de processo trabalhista
        custa R$ 30k+ em honorários e indenização. R$ 199 pra evitar isso é barato.
      </p>

      <h2>Próximo passo</h2>
      <p>
        Tem o CNPJ em mãos? <Link href="/consultar/cnpj">Puxe a capivara da empresa</Link> agora.
      </p>
    </>
  );
}
