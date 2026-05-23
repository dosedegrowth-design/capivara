"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Search,
  AlertTriangle,
  Bug,
  DollarSign,
  Settings,
  LogOut,
  ShieldAlert,
  Package,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Mascot } from "@/components/capivara/mascot";
import { signOutAction } from "@/lib/auth/actions";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Visão geral", exact: true },
  { href: "/admin/usuarios", icon: Users, label: "Usuários" },
  { href: "/admin/empresas", icon: Building2, label: "Empresas" },
  { href: "/admin/consultas", icon: Search, label: "Consultas" },
  { href: "/admin/produtos", icon: Package, label: "Produtos" },
  { href: "/admin/anti-fraude", icon: ShieldAlert, label: "Anti-fraude" },
  { href: "/admin/erros", icon: Bug, label: "Erros & logs" },
  { href: "/admin/financeiro", icon: DollarSign, label: "Financeiro" },
  { href: "/admin/lgpd", icon: AlertTriangle, label: "LGPD" },
  { href: "/admin/aceites", icon: AlertTriangle, label: "Audit Aceites" },
  { href: "/admin/configuracoes", icon: Settings, label: "Configurações" },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const path = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-cocoa text-cream border-r border-cocoa-2 shrink-0">
      <div className="p-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 group">
          <Mascot pose="padrao" size={32} animate={false} />
          <span className="font-display text-lg font-bold text-cream">
            capivara
          </span>
          <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-saffron">
            admin
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label, exact }) => {
          const ativo = exact ? path === href : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                ativo
                  ? "bg-saffron text-cocoa"
                  : "text-cream/80 hover:bg-white/5 hover:text-cream"
              )}
            >
              <Icon className="size-4" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-2">
        <div className="px-3 py-2">
          <p className="text-xs text-cream/60 font-mono">Logado como</p>
          <p className="text-sm font-medium text-cream truncate">{userName}</p>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-cream/80 hover:bg-white/5 hover:text-cream transition-colors"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
