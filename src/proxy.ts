import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Proxy Capivara (Next.js 16 — substitui o antigo middleware.ts).
 * Refresh de sessao Supabase + protecao de rotas privadas.
 *
 * Rotas protegidas:
 *   /dashboard/*    (cliente B2C)
 *   /empresa/*      (cliente B2B)
 *   /admin/*        (painel interno)
 *
 * Rotas publicas: marketing, /consultar (compra sem login), webhooks Asaas.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: "capivara" },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  // Cuidado: '/empresas' (plural, publica) e DIFERENTE de '/empresa/...' (B2B logada).
  // Usar match exato + barra final para diferenciar.
  const isProtected =
    path.startsWith("/dashboard/") || path === "/dashboard" ||
    path.startsWith("/empresa/") || path === "/empresa" ||
    path.startsWith("/admin/") || path === "/admin";

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Admin precisa ter account_type='admin'
  if ((path === "/admin" || path.startsWith("/admin/")) && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type")
      .eq("id", user.id)
      .single();

    if (profile?.account_type !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Empresa precisa ter active_company_id + ser membro dela.
  // (Sem esse guard, qualquer user logado enumera rotas B2B mesmo sem membership.)
  if ((path === "/empresa" || path.startsWith("/empresa/")) && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("active_company_id, account_type")
      .eq("id", user.id)
      .single();

    // Super admin do sistema pode ver /empresa/* pra suporte
    if (profile?.account_type !== "admin") {
      if (!profile?.active_company_id) {
        return NextResponse.redirect(new URL("/onboarding/empresa", request.url));
      }
      const { data: member } = await supabase
        .from("company_members")
        .select("id")
        .eq("company_id", profile.active_company_id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!member) {
        return NextResponse.redirect(new URL("/onboarding/empresa", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths exceto:
     * - _next/static, _next/image, favicon.ico
     * - assets em /brand
     * - rotas de webhook publicas
     */
    // Exclui: static, assets, webhooks Asaas, e a API publica B2B v1
    // (esta e' stateless por API key — nao precisa refresh de sessao).
    "/((?!_next/static|_next/image|favicon.ico|brand|api/asaas/webhook|api/v1/).*)",
  ],
};
