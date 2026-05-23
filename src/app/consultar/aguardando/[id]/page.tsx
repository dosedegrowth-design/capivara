import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findPlano, findProdutoAvulso, findComboLeilao } from "@/lib/consultas/planos";
import { AguardandoPagamento } from "./aguardando";

export default async function AguardandoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Buscar consulta
  const { data: consulta } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!consulta || consulta.user_id !== user.id) redirect("/dashboard");

  // Buscar transaction com QR Code (via admin pq pode ter sido criada com service_role)
  const admin = createAdminClient();
  const { data: tx } = await admin
    .from("transactions")
    .select("*")
    .eq("asaas_payment_id", consulta.asaas_payment_id ?? "")
    .maybeSingle();

  // Ja pago? Vai pro resultado
  if (consulta.status === "completed") redirect(`/historico/${id}`);

  // Detecta nome do plano/produto pro display.
  // Ordem: plano combo (cpf-*, cnpj-*, veicular-*) > combo leilao > produto avulso
  const planoCombo = findPlano(consulta.plan_tier);
  const comboLeilao = !planoCombo ? findComboLeilao(consulta.plan_tier) : undefined;
  const produtoAvulso =
    !planoCombo && !comboLeilao ? findProdutoAvulso(consulta.plan_tier) : undefined;

  const nomeProduto =
    planoCombo?.nome ?? comboLeilao?.nome ?? produtoAvulso?.nome ?? consulta.plan_tier;
  const descricaoProduto =
    planoCombo?.descricao ?? comboLeilao?.descricao ?? produtoAvulso?.descricao ?? null;
  const bullets = produtoAvulso?.bullets ?? null;
  const isAvulso = Boolean(produtoAvulso);

  return (
    <AguardandoPagamento
      consultaId={id}
      status={consulta.status}
      paymentType={consulta.payment_type}
      pixQrcode={tx?.pix_qrcode ?? null}
      pixCopyPaste={tx?.pix_copy_paste ?? null}
      boletoUrl={tx?.boleto_url ?? null}
      amountCents={consulta.amount_cents}
      nomeProduto={nomeProduto}
      descricaoProduto={descricaoProduto}
      bullets={bullets}
      isAvulso={isAvulso}
    />
  );
}
