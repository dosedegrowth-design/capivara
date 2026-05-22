"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Coins,
  History,
  Receipt,
  Code2,
  Webhook,
  LogOut,
  Search,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Mascot } from "@/components/capivara/mascot";
import { signOutAction } from "@/lib/auth/actions";

const NAV = [
  { href: "/empresa", icon: LayoutDashboard, label: "Visão geral", exact: true },
  { href: "/empresa/nova-consulta", icon: Search, label: "Nova consulta" },
  { href: "/empresa/historico", icon: History, label: "Histórico" },
  { href: "/empresa/creditos", icon: Coins, label: "Créditos" },
  { href: "/empresa/equipe", icon: Users, label: "Equipe" },
  { href: "/empresa/api", icon: Code2, label: "API & integrações" },
  { href: "/empresa/webhooks", icon: Webhook, label: "Webhooks" },
  { href: "/empresa/faturamento", icon: Receipt, label: "Faturamento" },
];

export function EmpresaSidebar({
  userName,
  companyName,
}: {
  userName: string;
  companyName: string;
}) {
  const path = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-card border-r border-line shrink-0">
      <div className="p-5 border-b border-line">
        <Link href="/" className="flex items-center gap-2 group">
          <Mascot pose="padrao" size={32} animate={false} />
          <span className="font-display text-lg font-bold text-cocoa group-hover:text-fur transition-colors">
            capivara
          </span>
        </Link>
        <p className="text-[10px] font-mono uppercase tracking-widest text-tabaco mt-2">
          Empresa
        </p>
        <p className="text-sm font-medium text-cocoa truncate" title={companyName}>
          {companyName}
        </p>
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
                  ? "bg-cocoa text-cream"
                  : "text-tabaco hover:bg-cream hover:text-cocoa"
              )}
            >
              <Icon className="size-4" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-line space-y-2">
        <div className="px-3 py-2">
          <p className="text-xs text-tabaco font-mono">Logada como</p>
          <p className="text-sm font-medium text-cocoa truncate">{userName}</p>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-tabaco hover:bg-cream hover:text-cocoa transition-colors"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
