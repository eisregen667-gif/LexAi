import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Users, TrendingUp, FileText, DollarSign } from "lucide-react";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verificar se é admin
  const { data: assinatura } = await supabase
    .from("assinaturas")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();

  if (!assinatura?.is_admin) redirect("/processos");

  // Buscar todos os usuários e assinaturas
  const { data: assinaturas } = await supabase
    .from("assinaturas")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: processos } = await supabase
    .from("processos")
    .select("id, status, created_at")
    .eq("status", "concluido");

  const total = assinaturas?.length ?? 0;
  const pagantes = assinaturas?.filter(a => a.plano !== "gratuito").length ?? 0;
  const pro = assinaturas?.filter(a => a.plano === "pro").length ?? 0;
  const basico = assinaturas?.filter(a => a.plano === "basico").length ?? 0;
  const receitaEstimada = (pro * 197) + (basico * 97);
  const totalAnalises = processos?.length ?? 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink-50">Painel Admin</h1>
        <p className="text-ink-400 mt-1 text-sm">Visão geral do LexIA</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <Users size={20} className="text-gold-400 mx-auto mb-2" />
          <p className="font-display text-3xl text-ink-50">{total}</p>
          <p className="text-ink-500 text-sm mt-1">Usuários total</p>
        </div>
        <div className="card text-center border-gold-500/20">
          <DollarSign size={20} className="text-gold-400 mx-auto mb-2" />
          <p className="font-display text-3xl text-gold-400">R$ {receitaEstimada}</p>
          <p className="text-ink-500 text-sm mt-1">Receita estimada/mês</p>
        </div>
        <div className="card text-center border-success/20">
          <TrendingUp size={20} className="text-success mx-auto mb-2" />
          <p className="font-display text-3xl text-success">{pagantes}</p>
          <p className="text-ink-500 text-sm mt-1">Clientes pagantes</p>
        </div>
        <div className="card text-center">
          <FileText size={20} className="text-gold-400 mx-auto mb-2" />
          <p className="font-display text-3xl text-ink-50">{totalAnalises}</p>
          <p className="text-ink-500 text-sm mt-1">Análises feitas</p>
        </div>
      </div>

      {/* Breakdown de planos */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="card-sm text-center">
          <p className="font-display text-2xl text-ink-50">{assinaturas?.filter(a => a.plano === "gratuito").length ?? 0}</p>
          <p className="text-ink-500 text-xs mt-1">Gratuito</p>
        </div>
        <div className="card-sm text-center border-gold-500/20">
          <p className="font-display text-2xl text-gold-400">{basico}</p>
          <p className="text-ink-500 text-xs mt-1">Básico (R$97/mês)</p>
        </div>
        <div className="card-sm text-center border-gold-500/40">
          <p className="font-display text-2xl text-gold-300">{pro}</p>
          <p className="text-ink-500 text-xs mt-1">Pro (R$197/mês)</p>
        </div>
      </div>

      {/* Tabela de usuários */}
      <div className="card">
        <h2 className="font-display text-lg text-ink-50 mb-4">Todos os usuários</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700">
                <th className="text-left text-ink-400 font-medium pb-3 pr-4">User ID</th>
                <th className="text-left text-ink-400 font-medium pb-3 pr-4">Plano</th>
                <th className="text-left text-ink-400 font-medium pb-3 pr-4">Status</th>
                <th className="text-left text-ink-400 font-medium pb-3 pr-4">Análises</th>
                <th className="text-left text-ink-400 font-medium pb-3">Desde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800">
              {assinaturas?.map((a) => (
                <tr key={a.id} className="hover:bg-ink-800/50 transition-colors">
                  <td className="py-3 pr-4 text-ink-400 font-mono text-xs">{a.user_id.slice(0, 8)}...</td>
                  <td className="py-3 pr-4">
                    <span className={`badge border text-xs ${
                      a.plano === "pro"     ? "text-gold-400 bg-gold-500/10 border-gold-500/30" :
                      a.plano === "basico"  ? "text-ink-200 bg-ink-700 border-ink-600" :
                                             "text-ink-500 bg-ink-900 border-ink-800"
                    }`}>
                      {a.plano}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`badge border text-xs ${
                      a.status === "ativo" ? "text-success bg-success/10 border-success/30" :
                                            "text-danger bg-danger/10 border-danger/30"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-ink-300">{a.analises_mes_atual ?? 0}</td>
                  <td className="py-3 text-ink-500 text-xs">
                    {new Date(a.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}