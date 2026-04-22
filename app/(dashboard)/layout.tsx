import { redirect } from "next/navigation";
import Link from "next/link";
import { Scale, LayoutDashboard, PlusCircle, LogOut, User, BarChart2, GitCompare, FileEdit } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import NavSidebar from "@/components/NavSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const nomeUsuario = user.user_metadata?.nome_completo
    ? (user.user_metadata.nome_completo as string).split(" ")[0]
    : user.email?.split("@")[0] ?? "Advogado";

  return (
    <div className="min-h-screen bg-ink-950 flex">
      <NavSidebar nomeUsuario={nomeUsuario} email={user.email ?? ""} />
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}
