"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, History, CreditCard, Settings, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { Mascot } from "@/components/capivara/mascot";
import { signOutAction } from "@/lib/auth/actions";

const NAV = [
  { href: "/dashboard", icon: Home, label: "Início" },
  { href: "/dashboard/nova-consulta", icon: Search, label: "Nova consulta" },
  { href: "/dashboard/historico", icon: History, label: "Histórico" },
  { href: "/dashboard/pagamentos", icon: CreditCard, label: "Pagamentos" },
  { href: "/dashboard/configuracoes", icon: Settings, label: "Configurações" },
];

export function AppSidebar({ userName }: { userName: string }) {
  const path = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-card border-r border-line shrink-0">
      {/* Brand */}
      <div className="p-5 border-b border-line">
        <Link href="/" className="flex items-center gap-2 group">
          <Mascot pose="padrao" size={32} animate={false} />
          <span className="font-display text-lg font-bold text-cocoa group-hover:text-fur transition-colors">
            capivara
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const ativo = path === href || (href !== "/dashboard" && path.startsWith(href));
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

      {/* User + logout */}
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
