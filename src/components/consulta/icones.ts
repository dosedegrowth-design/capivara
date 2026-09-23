import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  Briefcase,
  Building2,
  Camera,
  Car,
  CarFront,
  Check,
  ClipboardList,
  Eye,
  FileCheck,
  FileDigit,
  FileSignature,
  FileText,
  FileWarning,
  Gavel,
  HelpCircle,
  Home,
  IdCard,
  Layers,
  Lock,
  MapPin,
  Radar,
  Receipt,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Store,
  TrendingUp,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Mapa unico de icones do catalogo. Fica aqui (e nao espalhado por card)
 * porque icone que existe no Lucide mas nao esta registrado cai silenciosamente
 * no HelpCircle — so aparece olhando a tela.
 */
export const ICONES_CATALOGO: Record<string, LucideIcon> = {
  AlertCircle,
  AlertTriangle,
  Banknote,
  Briefcase,
  Building2,
  Camera,
  Car,
  CarFront,
  Check,
  ClipboardList,
  Eye,
  FileCheck,
  FileDigit,
  FileSignature,
  FileText,
  FileWarning,
  Gavel,
  Home,
  IdCard,
  Layers,
  Lock,
  MapPin,
  Radar,
  Receipt,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Store,
  TrendingUp,
  UserRound,
  Users,
};

export function resolveIcone(nome?: string): LucideIcon {
  if (!nome) return HelpCircle;
  return ICONES_CATALOGO[nome] ?? HelpCircle;
}

/** Nomes usados no catalogo que nao estao no mapa (roda nos testes). */
export function iconesFaltando(nomes: (string | undefined)[]): string[] {
  return [...new Set(nomes.filter((n): n is string => Boolean(n)))].filter(
    (n) => !(n in ICONES_CATALOGO)
  );
}
