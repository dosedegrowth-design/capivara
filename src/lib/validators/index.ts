import { z } from "zod";
import { isValidCNPJ, isValidCPF, isValidPlaca } from "@/lib/formatters";

// =========================================================================
// Schemas reutilizaveis
// =========================================================================

export const cpfSchema = z
  .string()
  .refine(isValidCPF, { message: "CPF invalido" });

export const cnpjSchema = z
  .string()
  .refine(isValidCNPJ, { message: "CNPJ invalido" });

export const placaSchema = z
  .string()
  .refine(isValidPlaca, { message: "Placa invalida (use AAA0000 ou AAA0A00)" });

export const emailSchema = z.string().email("Email invalido");

export const senhaSchema = z
  .string()
  .min(8, "Minimo 8 caracteres")
  .max(72, "Maximo 72 caracteres");

export const telefoneSchema = z
  .string()
  .regex(/^\d{10,11}$/, "Telefone invalido (10 ou 11 digitos)");

// =========================================================================
// Finalidades LGPD obrigatorias por categoria
// =========================================================================

export const finalidadeCPFSchema = z.enum([
  "credit_analysis",       // Analise de credito
  "rental_check",          // Verificacao para locacao
  "employment_check",      // Verificacao para contratacao (RH)
  "commercial_relation",   // Estabelecer relacao comercial
  "identity_verification", // Verificar identidade
  "self_check",            // Consultar a mim mesmo
  "other",                 // Outros — exige descricao
]);

export const finalidadeCNPJSchema = z.enum([
  "credit_analysis",
  "due_diligence",
  "supplier_check",
  "partnership_check",
  "self_check",
  "other",
]);

export const finalidadeVeicularSchema = z.enum([
  "pre_purchase",          // Antes de comprar
  "pre_sale",              // Antes de vender
  "insurance_check",       // Seguro
  "financing_check",       // Financiamento
  "own_vehicle",           // Meu veiculo
  "other",
]);

// =========================================================================
// Schemas de iniciar consulta
// =========================================================================

export const iniciarConsultaCPFSchema = z.object({
  cpf: cpfSchema,
  plano: z.enum(["espiadinha", "investigacao", "avancada", "premium", "raio-x"]),
  finalidade: finalidadeCPFSchema,
  finalidadeDescricao: z.string().optional(),
  pagamento: z.enum(["pix", "boleto", "cartao_avista", "folhas"]),
});

export const iniciarConsultaCNPJSchema = z.object({
  cnpj: cnpjSchema,
  plano: z.enum(["espiadinha", "socios", "premium", "total"]),
  finalidade: finalidadeCNPJSchema,
  finalidadeDescricao: z.string().optional(),
  pagamento: z.enum(["pix", "boleto", "cartao_avista", "folhas"]),
});

export const iniciarConsultaVeicularSchema = z.object({
  placa: placaSchema,
  plano: z.enum(["espiadinha", "completo", "avancado", "premium", "total"]),
  finalidade: finalidadeVeicularSchema,
  finalidadeDescricao: z.string().optional(),
  pagamento: z.enum(["pix", "boleto", "cartao_avista", "folhas"]),
});

// =========================================================================
// Auth
// =========================================================================

export const cadastroSchema = z.object({
  email: emailSchema,
  senha: senhaSchema,
  nomeCompleto: z.string().min(3, "Nome muito curto"),
  cpf: cpfSchema,
  telefone: telefoneSchema.optional(),
  lgpdAceito: z
    .boolean()
    .refine((v) => v === true, { message: "Voce precisa aceitar os termos" }),
});

export const loginSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, "Senha obrigatoria"),
});

export type IniciarConsultaCPFInput = z.infer<typeof iniciarConsultaCPFSchema>;
export type IniciarConsultaCNPJInput = z.infer<typeof iniciarConsultaCNPJSchema>;
export type IniciarConsultaVeicularInput = z.infer<typeof iniciarConsultaVeicularSchema>;
export type CadastroInput = z.infer<typeof cadastroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
