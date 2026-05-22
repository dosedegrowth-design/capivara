/**
 * Script de seed: cria 3 contas de teste pra revisar os 3 paineis.
 *
 * Uso:
 *   npm run seed:test
 *
 * Cria:
 *   admin@capivara.app      - account_type='admin'         - /admin
 *   cliente@capivara.app    - account_type='pf'            - /dashboard
 *   empresa@capivara.app    - account_type='pj_admin'      - /empresa (+ Capivara Demo Ltda)
 *
 * Senha de todos: Capivara2026!
 *
 * Além disso popula:
 *   - 8 consultas pra cliente B2C (varios planos + status)
 *   - 12 consultas pra empresa (algumas via API)
 *   - 2 transactions B2B (recarga + ajuste manual)
 *   - 1 API key na empresa
 *   - 1 webhook na empresa
 *   - Aceites legais pra todos (ToS, Privacy, Responsabilidade etc.)
 *
 * Idempotente: roda multiplas vezes sem duplicar (usa upsert por email).
 *
 * Pre-requisitos:
 *   - .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 *   - Migrations 0001-0011 aplicadas
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { config } from "dotenv";
import { resolve } from "path";

// Carrega .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Faltam variáveis: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Cliente admin (RLS-free)
const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Cliente pra acessar o schema capivara
const capivara = createClient(SUPABASE_URL, SERVICE_KEY, {
  db: { schema: "capivara" },
  auth: { persistSession: false, autoRefreshToken: false },
});

const SENHA_PADRAO = "Capivara2026!";

const PLANOS = {
  cpf: ["cpf-espiadinha", "cpf-investigacao", "cpf-avancada", "cpf-premium", "cpf-raio-x"],
  cnpj: ["cnpj-espiadinha", "cnpj-socios", "cnpj-premium", "cnpj-total"],
  veicular: ["veicular-espiadinha", "veicular-completo", "veicular-avancado", "veicular-premium"],
};

const PRECOS_B2C = {
  "cpf-espiadinha": 990, "cpf-investigacao": 1990, "cpf-avancada": 3990, "cpf-premium": 8990, "cpf-raio-x": 19900,
  "cnpj-espiadinha": 790, "cnpj-socios": 1490, "cnpj-premium": 4990, "cnpj-total": 19900,
  "veicular-espiadinha": 1490, "veicular-completo": 2490, "veicular-avancado": 4990, "veicular-premium": 8990,
};

const FOLHAS_B2B: Record<string, number> = {
  "cpf-espiadinha": 6, "cpf-investigacao": 12, "cpf-avancada": 24, "cpf-premium": 48, "cpf-raio-x": 96,
  "cnpj-espiadinha": 5, "cnpj-socios": 12, "cnpj-premium": 24, "cnpj-total": 60,
  "veicular-espiadinha": 8, "veicular-completo": 16, "veicular-avancado": 28, "veicular-premium": 50,
};

// =============================================================================
// Helpers
// =============================================================================

async function ensureUser(email: string, password: string, metadata: Record<string, unknown>): Promise<string> {
  // Procura por email
  const { data: existingList } = await supabase.auth.admin.listUsers({ perPage: 200 });
  const existing = existingList?.users.find((u) => u.email === email);

  if (existing) {
    // Reset senha + metadata
    await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: metadata,
    });
    console.log(`  ↺ ${email} já existe — atualizado`);
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (error || !data.user) throw new Error(`Falha ao criar ${email}: ${error?.message}`);
  console.log(`  + ${email} criado`);
  return data.user.id;
}

async function updateProfile(userId: string, patch: Record<string, unknown>): Promise<void> {
  await capivara.from("profiles").update(patch).eq("id", userId);
}

function randomCPF(): string {
  // 11 dígitos válidos com DV calculado
  const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const calc = (slice: number[], factor: number): number => {
    const sum = slice.reduce((acc, n, i) => acc + n * (factor - i), 0);
    const mod = (sum * 10) % 11;
    return mod >= 10 ? 0 : mod;
  };
  digits.push(calc(digits, 10));
  digits.push(calc(digits, 11));
  return digits.join("");
}

function randomPlaca(): string {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return (
    letras[Math.floor(Math.random() * 26)] +
    letras[Math.floor(Math.random() * 26)] +
    letras[Math.floor(Math.random() * 26)] +
    Math.floor(Math.random() * 10) +
    letras[Math.floor(Math.random() * 26)] +
    Math.floor(Math.random() * 10) +
    Math.floor(Math.random() * 10)
  );
}

function hashTarget(planoId: string, target: string): string {
  return createHash("sha256").update(`${planoId}:${target}`).digest("hex");
}

async function logConsent(
  userId: string,
  companyId: string | null,
  type: string,
  version: string
): Promise<void> {
  const text = `Documento ${type} versão ${version} aceito via script de seed.\n\nEste é um placeholder do texto. Em produção, o texto completo viria de src/lib/legal/documents.ts.`;
  const hash = createHash("sha256").update(text).digest("hex");

  await capivara.from("consent_logs").insert({
    user_id: userId,
    company_id: companyId,
    document_type: type,
    document_version: version,
    document_hash: hash,
    document_text: text,
    ip_address: "127.0.0.1",
    user_agent: "capivara-seed-script/1.0",
    metadata: { context: "seed" },
  });
}

// =============================================================================
// Seed principal
// =============================================================================

async function main() {
  console.log("\n🐾 Capivara — seed de contas de teste\n");

  // ============================================================
  // 1. Admin
  // ============================================================
  console.log("[1/3] Admin");
  const adminId = await ensureUser(
    "admin@capivara.app",
    SENHA_PADRAO,
    {
      full_name: "Capivara Admin",
      cpf: "12345678909",
      account_type: "admin",
      lgpd_accepted: true,
    }
  );
  await updateProfile(adminId, {
    full_name: "Capivara Admin",
    cpf: "12345678909",
    account_type: "admin",
    phone: "11999990000",
  });
  await logConsent(adminId, null, "terms_of_use", "1.1.0");
  await logConsent(adminId, null, "privacy_policy", "1.1.0");

  // ============================================================
  // 2. Cliente B2C
  // ============================================================
  console.log("\n[2/3] Cliente B2C");
  const clienteId = await ensureUser(
    "cliente@capivara.app",
    SENHA_PADRAO,
    {
      full_name: "Joana Cliente Teste",
      cpf: randomCPF(),
      account_type: "pf",
      lgpd_accepted: true,
    }
  );
  const clienteCpf = randomCPF();
  await updateProfile(clienteId, {
    full_name: "Joana Cliente Teste",
    cpf: clienteCpf,
    account_type: "pf",
    phone: "11988887777",
  });
  await logConsent(clienteId, null, "terms_of_use", "1.1.0");
  await logConsent(clienteId, null, "privacy_policy", "1.1.0");

  // 8 consultas B2C variadas
  console.log("    → criando 8 consultas B2C...");
  const consultasB2C = [
    { categoria: "cpf", plano: "cpf-investigacao", status: "completed", finalidade: "credit_analysis" },
    { categoria: "cpf", plano: "cpf-avancada", status: "completed", finalidade: "rental_check" },
    { categoria: "cpf", plano: "cpf-espiadinha", status: "completed", finalidade: "identity_verification" },
    { categoria: "cnpj", plano: "cnpj-socios", status: "completed", finalidade: "due_diligence" },
    { categoria: "cnpj", plano: "cnpj-premium", status: "completed", finalidade: "supplier_check" },
    { categoria: "veicular", plano: "veicular-completo", status: "completed", finalidade: "pre_purchase" },
    { categoria: "veicular", plano: "veicular-avancado", status: "completed", finalidade: "pre_purchase" },
    { categoria: "cpf", plano: "cpf-investigacao", status: "pending_payment", finalidade: "credit_analysis" },
  ];

  for (let i = 0; i < consultasB2C.length; i++) {
    const c = consultasB2C[i];
    const target =
      c.categoria === "cpf"
        ? randomCPF()
        : c.categoria === "cnpj"
        ? "12345678000190"
        : randomPlaca();
    const preco = PRECOS_B2C[c.plano as keyof typeof PRECOS_B2C] ?? 1990;
    const createdAt = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString();

    const { data: consulta } = await capivara
      .from("consultations")
      .insert({
        user_id: clienteId,
        category: c.categoria,
        plan_tier: c.plano,
        target_value: target,
        target_normalized: target,
        target_hash: hashTarget(c.plano, target),
        finality: c.finalidade,
        payment_type: "pix",
        amount_cents: preco,
        status: c.status,
        source: "web",
        created_at: createdAt,
        paid_at: c.status !== "pending_payment" ? createdAt : null,
        completed_at: c.status === "completed" ? createdAt : null,
        result_jsonb: c.status === "completed" ? generateMockResult(c.categoria) : null,
        ip_address: "127.0.0.1",
        user_agent: "seed",
      })
      .select("id")
      .single();

    // Registra aceite de responsabilidade ligado a consulta
    if (consulta) {
      await logConsent(clienteId, null, "consultation_responsibility", "1.1.0");
    }

    // Transaction
    await capivara.from("transactions").insert({
      user_id: clienteId,
      type: "consultation",
      reference_id: consulta?.id,
      payment_method: "pix",
      amount_cents: preco,
      status: c.status === "completed" ? "paid" : "pending",
      created_at: createdAt,
      paid_at: c.status !== "pending_payment" ? createdAt : null,
    });
  }

  // ============================================================
  // 3. Empresa B2B
  // ============================================================
  console.log("\n[3/3] Empresa B2B");
  const empresaUserId = await ensureUser(
    "empresa@capivara.app",
    SENHA_PADRAO,
    {
      full_name: "Roberto Empresário Teste",
      cpf: randomCPF(),
      account_type: "pj_admin",
      lgpd_accepted: true,
    }
  );
  await updateProfile(empresaUserId, {
    full_name: "Roberto Empresário Teste",
    cpf: randomCPF(),
    account_type: "pj_admin",
    phone: "11977776666",
  });
  await logConsent(empresaUserId, null, "terms_of_use", "1.1.0");
  await logConsent(empresaUserId, null, "privacy_policy", "1.1.0");

  // Empresa demo
  let empresaId: string;
  const { data: existingEmpresa } = await capivara
    .from("companies")
    .select("id")
    .eq("cnpj", "12345678000190")
    .maybeSingle();

  if (existingEmpresa) {
    empresaId = existingEmpresa.id;
    await capivara
      .from("companies")
      .update({
        folhas_balance: 850,
        owner_id: empresaUserId,
      })
      .eq("id", empresaId);
    console.log(`  ↺ Empresa "Capivara Demo Ltda" já existe — saldo atualizado`);
  } else {
    const { data: novaEmpresa, error } = await capivara
      .from("companies")
      .insert({
        name: "Capivara Demo Ltda",
        cnpj: "12345678000190",
        razao_social: "CAPIVARA DEMONSTRACAO COMERCIAL LTDA",
        owner_id: empresaUserId,
        email_billing: "empresa@capivara.app",
        plan_tier: "pro",
        folhas_balance: 850,
      })
      .select("id")
      .single();

    if (error || !novaEmpresa) throw new Error(`Falha ao criar empresa: ${error?.message}`);
    empresaId = novaEmpresa.id;
    console.log(`  + Empresa "Capivara Demo Ltda" criada`);
  }

  // Atualiza profile com active_company_id
  await updateProfile(empresaUserId, { active_company_id: empresaId });

  // Membership admin
  const { data: existingMember } = await capivara
    .from("company_members")
    .select("id")
    .eq("company_id", empresaId)
    .eq("user_id", empresaUserId)
    .maybeSingle();

  if (!existingMember) {
    await capivara.from("company_members").insert({
      company_id: empresaId,
      user_id: empresaUserId,
      role: "admin",
      accepted_at: new Date().toISOString(),
    });
  }

  await logConsent(empresaUserId, empresaId, "company_terms", "1.0.0");

  // Transaction de recarga (paga) que deu origem ao saldo
  const { data: existingRecharge } = await capivara
    .from("transactions")
    .select("id")
    .eq("company_id", empresaId)
    .eq("type", "recharge")
    .maybeSingle();

  if (!existingRecharge) {
    await capivara.from("transactions").insert({
      user_id: empresaUserId,
      company_id: empresaId,
      type: "recharge",
      payment_method: "pix",
      amount_cents: 100000, // R$ 1.000
      folhas_added: 1400,
      bonus_percentage: 40,
      status: "paid",
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      paid_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    console.log(`    + Recarga R$ 1.000 (+1400 cr) registrada`);
  }

  // API key
  const { data: existingKey } = await capivara
    .from("api_keys")
    .select("id")
    .eq("company_id", empresaId)
    .is("revoked_at", null)
    .maybeSingle();

  let apiKeyId: string;
  if (existingKey) {
    apiKeyId = existingKey.id;
  } else {
    // Gera chave determinística pro teste (DON'T do isso em produção)
    const fakeKey = "cap_live_DemoKey1234567890DemoKey1234567";
    const fakeHash = createHash("sha256").update(fakeKey).digest("hex");
    const { data: novaKey } = await capivara
      .from("api_keys")
      .insert({
        company_id: empresaId,
        created_by: empresaUserId,
        name: "Chave de demonstração",
        key_hash: fakeHash,
        key_prefix: "cap_live_Dem",
        scopes: ["consultations:write", "consultations:read"],
        rate_limit_per_min: 60,
      })
      .select("id")
      .single();
    apiKeyId = novaKey!.id;
    console.log(`    + API key criada (cap_live_Dem…)`);
    await logConsent(empresaUserId, empresaId, "api_terms", "1.0.0");
  }

  // Webhook endpoint demo
  const { data: existingHook } = await capivara
    .from("webhook_endpoints")
    .select("id")
    .eq("company_id", empresaId)
    .maybeSingle();

  if (!existingHook) {
    await capivara.from("webhook_endpoints").insert({
      company_id: empresaId,
      created_by: empresaUserId,
      url: "https://webhook.site/demo-capivara",
      description: "Endpoint demo",
      secret: "whsec_demo_secret_para_visualizacao_apenas",
      events: ["consultation.completed", "consultation.failed", "payment.confirmed"],
      active: true,
    });
    console.log(`    + Webhook endpoint demo criado`);
  }

  // 12 consultas B2B variadas (mix web + api)
  console.log("    → criando 12 consultas B2B...");
  const consultasB2B = [
    { categoria: "cpf", plano: "cpf-investigacao", source: "web", externalRef: null },
    { categoria: "cpf", plano: "cpf-avancada", source: "web", externalRef: null },
    { categoria: "cnpj", plano: "cnpj-premium", source: "api", externalRef: "ticket-001" },
    { categoria: "cnpj", plano: "cnpj-total", source: "api", externalRef: "ticket-002" },
    { categoria: "veicular", plano: "veicular-completo", source: "api", externalRef: "vistoria-001" },
    { categoria: "veicular", plano: "veicular-avancado", source: "api", externalRef: "vistoria-002" },
    { categoria: "cpf", plano: "cpf-investigacao", source: "api", externalRef: "lead-100" },
    { categoria: "cpf", plano: "cpf-avancada", source: "api", externalRef: "lead-101" },
    { categoria: "cnpj", plano: "cnpj-socios", source: "web", externalRef: null },
    { categoria: "veicular", plano: "veicular-premium", source: "web", externalRef: null },
    { categoria: "cpf", plano: "cpf-investigacao", source: "api", externalRef: "lead-102" },
    { categoria: "cpf", plano: "cpf-espiadinha", source: "api", externalRef: "lead-103" },
  ];

  for (let i = 0; i < consultasB2B.length; i++) {
    const c = consultasB2B[i];
    const target =
      c.categoria === "cpf"
        ? randomCPF()
        : c.categoria === "cnpj"
        ? "12345678000190"
        : randomPlaca();
    const folhas = FOLHAS_B2B[c.plano] ?? 12;
    const createdAt = new Date(Date.now() - (i + 1) * 12 * 60 * 60 * 1000).toISOString();
    const status = i % 8 === 0 ? "error" : "completed";

    await capivara.from("consultations").insert({
      user_id: empresaUserId,
      company_id: empresaId,
      api_key_id: c.source === "api" ? apiKeyId : null,
      category: c.categoria,
      plan_tier: c.plano,
      target_value: target,
      target_normalized: target,
      target_hash: hashTarget(c.plano, target),
      finality: "due_diligence",
      payment_type: "folhas",
      amount_cents: 0,
      folhas_used: folhas,
      status,
      source: c.source,
      external_reference: c.externalRef,
      cost_center: c.source === "api" ? "automacao" : "comercial-sp",
      created_at: createdAt,
      paid_at: createdAt,
      completed_at: status === "completed" ? createdAt : null,
      result_jsonb: status === "completed" ? generateMockResult(c.categoria) : null,
    });
  }

  // ============================================================
  // Fim
  // ============================================================
  console.log("\n✅ Seed completo!\n");
  console.log("┌─────────────────────────────────────────────────────────┐");
  console.log("│  CONTAS DE TESTE                                        │");
  console.log("├─────────────────────────────────────────────────────────┤");
  console.log(`│  Admin    → admin@capivara.app    · ${SENHA_PADRAO}     │`);
  console.log(`│  Cliente  → cliente@capivara.app  · ${SENHA_PADRAO}     │`);
  console.log(`│  Empresa  → empresa@capivara.app  · ${SENHA_PADRAO}     │`);
  console.log("├─────────────────────────────────────────────────────────┤");
  console.log("│  PAINÉIS                                                │");
  console.log("│  Admin   → /admin                                       │");
  console.log("│  B2C     → /dashboard                                   │");
  console.log("│  B2B     → /empresa                                     │");
  console.log("└─────────────────────────────────────────────────────────┘\n");
}

// =============================================================================
// Mock data gen
// =============================================================================
function generateMockResult(categoria: string): Record<string, unknown> {
  return {
    sections: [
      {
        title: "Dados básicos",
        kind: "kv",
        items: [
          { label: "Tipo", value: categoria.toUpperCase() },
          { label: "Situação", value: "REGULAR" },
          { label: "Atualizado em", value: new Date().toISOString().slice(0, 10) },
        ],
      },
      {
        title: "Score de crédito",
        kind: "kv",
        items: [
          { label: "Score Serasa", value: "742" },
          { label: "Classe", value: "Bom pagador" },
        ],
      },
    ],
    _seed: true,
    _categoria: categoria,
  };
}

main().catch((e) => {
  console.error("\n❌ Erro no seed:", e);
  process.exit(1);
});
