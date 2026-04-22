"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale, LayoutDashboard, PlusCircle, LogOut, User,
  BarChart2, GitCompare, FileEdit, CreditCard, Settings, ShieldAlert
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAssinatura } from "@/lib/useAssinatura";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/processos",     icon: LayoutDashboard, label: "Meus processos" },
  { href: "/painel",        icon: BarChart2,        label: "Painel",        proPlan: true },
  { href: "/comparar",      icon: GitCompare,       label: "Comparar",      proPlan: true },
  { href: "/minuta",        icon: FileEdit,         label: "Minuta",        proPlan: true },
  { href: "/processo/novo", icon: PlusCircle,       label: "Novo processo", destaque: true },
];

const navBottom = [
  { href: "/planos", icon: CreditCard, label: "Planos" },
  { href: "/perfil", icon: Settings,   label: "Minha conta" },
];

export default function NavSidebar({ nomeUsuario, email }: { nomeUsuario: string; email: string }) {
  const pathname          = usePathname();
  const router            = useRouter();
  const supabase          = createClient();
  const { assinatura }    = useAssinatura();
  const plano             = assinatura?.plano ?? "gratuito";
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("assinaturas")
        .select("is_admin")
        .eq("user_id", user.id)
        .single();
      setIsAdmin(data?.is_admin ?? false);
    }
    checkAdmin();
  }, []);

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 border-r border-ink-800 bg-ink-900/50 flex flex-col">

      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-ink-800">
        <Link href="/processos" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
            <Scale size={14} className="text-gold-400" />
          </div>
          <span className="font-display text-lg font-semibold text-ink-50 tracking-tight">
            Lex<span className="text-gold-400">IA</span>
          </span>
        </Link>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label, destaque, proPlan }) => {
          const ativo     = pathname === href || (href !== "/processos" && pathname.startsWith(href));
          const bloqueado = proPlan && plano !== "pro";

          return (
            <Link
              key={href}
              href={bloqueado ? "/planos" : href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${destaque && !ativo
                  ? "bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 border border-gold-500/20"
                  : ativo
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : bloqueado
                  ? "text-ink-600 border border-transparent cursor-pointer hover:bg-ink-800/50"
                  : "text-ink-400 hover:text-ink-200 hover:bg-ink-800 border border-transparent"
                }`}
            >
              <Icon size={16} />
              {label}
              {bloqueado && (
                <span className="ml-auto badge bg-gold-500/10 text-gold-500/60 border border-gold-500/20 text-[10px]">
                  Pro
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Nav inferior */}
      <div className="p-3 border-t border-ink-800 space-y-1">

        {/* Links inferiores */}
        {navBottom.map(({ href, icon: Icon, label }) => {
          const ativo = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${ativo
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ink-400 hover:text-ink-200 hover:bg-ink-800 border border-transparent"
                }`}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}

        {/* Link Admin — só aparece para admins */}
        {isAdmin && (
          <Link href="/admin"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
              ${pathname === "/admin"
                ? "bg-danger/10 text-danger border border-danger/30"
                : "text-danger/60 hover:text-danger hover:bg-danger/10 border border-transparent"
              }`}>
            <ShieldAlert size={16} />
            Admin
          </Link>
        )}

        {/* Badge upgrade */}
        {plano !== "pro" && (
          <Link href="/planos"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold-500/5 border border-gold-500/20 hover:bg-gold-500/10 transition-colors">
            <span className="text-gold-400 text-xs">⭐</span>
            <span className="text-gold-400/80 text-xs">Upgrade para Pro</span>
          </Link>
        )}

        {/* Usuário logado */}
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <div className="w-7 h-7 rounded-full bg-ink-700 flex items-center justify-center shrink-0">
            <User size={14} className="text-ink-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink-200 font-medium truncate">{nomeUsuario}</p>
            <p className="text-xs text-ink-500 truncate">{email}</p>
          </div>
        </div>

        <button
          onClick={sair}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm w-full text-ink-600 hover:text-ink-400 hover:bg-ink-800 transition-colors duration-200"
        >
          <LogOut size={15} /> Sair
        </button>
      </div>
    </aside>
  );
}
