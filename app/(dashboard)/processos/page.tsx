import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusCircle, FileText, Clock, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { ProcessoDB } from "@/lib/types";

export const metadata = { title: "Meus Processos" };

export default async function ProcessosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: processos } = await supabase
    .from("processos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const lista = (processos as ProcessoDB[]) ?? [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-ink-50">Meus Processos</h1>
          <p className="text-ink-400 mt-1 text-sm">{lista.length} processo{lista.length !== 1 ? "s" : ""} analisado{lista.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/processo/novo" className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} />
          Novo processo
        </Link>
      </div>

      {lista.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-ink-800 border border-ink-700 flex items-center justify-center mb-5">
            <FileText size={28} className="text-ink-600" />
          </div>
          <h3 className="font-display text-xl text-ink-300 mb-2">Nenhum processo ainda</h3>
          <p className="text-ink-500 text-sm mb-6 max-w-xs">Faça upload do PDF de um processo para obter resumo, linha do tempo e chat.</p>
          <Link href="/processo/novo" className="btn-primary flex items-center gap-2">
            <PlusCircle size={16} />
            Analisar primeiro processo
          </Link>
        </div>
      )}

      {lista.length > 0 && (
        <div className="space-y-3">
          {lista.map((p) => (
            <Link
              key={p.id}
              href={p.status === "concluido" ? `/processo/${p.id}` : "#"}
              className="card hover:border-ink-600 transition-all duration-200 flex items-center gap-4"
            >
              <FileText size={18} className="text-gold-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-ink-100 font-medium text-sm truncate">{p.analise?.numero_processo ?? p.nome_arquivo}</p>
                <p className="text-ink-500 text-xs truncate">{p.analise?.tipo_acao ?? p.nome_arquivo}</p>
              </div>
              <span className="badge border text-xs text-ink-400 bg-ink-800 border-ink-700">{p.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
