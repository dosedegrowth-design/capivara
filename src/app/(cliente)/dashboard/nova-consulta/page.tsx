import { redirect } from "next/navigation";

/**
 * Nova consulta dentro do dashboard reaproveita o fluxo publico de /consultar.
 * Como o usuario ja esta logado, o iniciarConsultaAction nao redireciona pra cadastro.
 */
export default async function NovaConsultaRedirect({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  if (cat && ["cpf", "cnpj", "veicular"].includes(cat)) {
    redirect(`/consultar/${cat}`);
  }
  redirect("/consultar");
}
