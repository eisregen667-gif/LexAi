import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AlertTriangle, Clock, FileText, TrendingUp } from "lucide-react";

export const metadata = { title: "Painel" };

export default async function PainelPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: processos } = await supabase
    .from("processos").select("*").eq("user_id", user.id).eq("status", "concluido");

  const lista = processos ?? [];

  const hoje = new Date();
  const em7dias = new Date(); em7dias.setDate(hoje.getDate() + 7);

  const todosPrazos = lista.flatMap(p =>
    (p.analise?.prazos ?? []).map((pz: any) => ({ ...pz, processo: p }))
  );

  const prazosUrgentes = todosPrazos.filter(pz => {
    if (!pz.data_limite || pz.cumprido) return false;
    const d = new Date(pz.data_limite);
    return d <= em7dias;
  }).sort((a, b) => a.data_limite.localeCompare(b.data_limite));

  const processosParados = lista.filter(p => {
    const updated = new Date(p.updated_at);
    const diff = (hoje.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 30;
  });

  const tiposAcao = lista.reduce<Record<string, number>>((acc, p) => {
    const tipo = p.analise?.tipo_acao ?? "Não identificado";
    acc[tipo] = (acc[tipo] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink-50">Painel do Escritório</h1>
        <p className="text-ink-400 mt-1 text-sm">Visão geral de todos os seus processos</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <p className="font-display text-3xl text-ink-50">{lista.length}</p>
          <p className="text-ink-500 text-sm mt-1">Total de processos</p>
        </div>
        <div className="card text-center border-danger/20">
          <p className="font-display text-3xl text-danger">{prazosUrgentes.length}</p>
          <p className="text-ink-500 text-sm mt-1">Prazos em 7 dias</p>
        </div>
        <div className="card text-center border-warning/20">
          <p className="font-display text-3xl text-warning">{processosParados.length}</p>
          <p className="text-ink-500 text-sm mt-1">Parados +30 dias</p>
        </div>
        <div className="card text-center border-gold-500/20">
          <p className="font-display text-3xl text-gold-400">{Object.keys(tiposAcao).length}</p>
          <p className="text-ink-500 text-sm mt-1">Tipos de ação</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Prazos urgentes */}
        <div className="card">
          <h2 className="font-display text-lg text-ink-50 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-danger" /> Prazos nos próximos 7 dias
          </h2>
          {prazosUrgentes.length === 0 ? (
            <p className="text-ink-500 text-sm">Nenhum prazo urgente. 🎉</p>
          ) : (
            <div className="space-y-3">
              {prazosUrgentes.slice(0, 5).map((pz, i) => (
                <Link key={i} href={`/processo/${pz.processo.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-ink-900 hover:bg-ink-800 transition-colors">
                  <Clock size={14} className="text-danger shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-ink-200 text-sm truncate">{pz.descricao}</p>
                    <p className="text-ink-500 text-xs mt-0.5">
                      {pz.processo.analise?.numero_processo ?? pz.processo.nome_arquivo} · {pz.data_limite}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Tipos de ação */}
        <div className="card">
          <h2 className="font-display text-lg text-ink-50 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-gold-400" /> Tipos de ação
          </h2>
          {Object.keys(tiposAcao).length === 0 ? (
            <p className="text-ink-500 text-sm">Nenhum processo analisado ainda.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(tiposAcao).sort((a, b) => b[1] - a[1]).map(([tipo, qtd]) => (
                <div key={tipo} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-ink-200 text-sm truncate">{tipo}</p>
                      <p className="text-ink-500 text-xs ml-2 shrink-0">{qtd}</p>
                    </div>
                    <div className="h-1.5 bg-ink-800 rounded-full">
                      <div className="h-1.5 bg-gold-500 rounded-full"
                        style={{ width: `${(qtd / lista.length) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processos parados */}
        {processosParados.length > 0 && (
          <div className="card lg:col-span-2">
            <h2 className="font-display text-lg text-ink-50 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-warning" /> Processos sem movimentação (+30 dias)
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {processosParados.map(p => (
                <Link key={p.id} href={`/processo/${p.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-ink-900 hover:bg-ink-800 transition-colors">
                  <FileText size={14} className="text-warning shrink-0" />
                  <div className="min-w-0">
                    <p className="text-ink-200 text-sm truncate">{p.analise?.numero_processo ?? p.nome_arquivo}</p>
                    <p className="text-ink-500 text-xs">{p.analise?.tipo_acao ?? "—"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
