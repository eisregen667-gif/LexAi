"use client";
import { useState, useEffect } from "react";
import { FileEdit, Loader2, Copy, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const TIPOS_MINUTA = [
  "Contestação", "Recurso de Apelação", "Agravo de Instrumento",
  "Petição de Juntada", "Embargos de Declaração", "Réplica",
  "Memoriais", "Pedido de Tutela Antecipada",
];

export default function MinutaPage() {
  const [processos, setProcessos]   = useState<any[]>([]);
  const [processoId, setProcessoId] = useState("");
  const [tipo, setTipo]             = useState(TIPOS_MINUTA[0]);
  const [instrucoes, setInstrucoes] = useState("");
  const [loading, setLoading]       = useState(false);
  const [minuta, setMinuta]         = useState<string | null>(null);
  const [copiado, setCopiado]       = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("processos").select("id, nome_arquivo, analise, status")
      .eq("status", "concluido").order("created_at", { ascending: false })
      .then(({ data }) => setProcessos(data ?? []));
  }, []);

  async function gerar() {
    if (!processoId) return;
    setLoading(true); setMinuta(null);
    const resp = await fetch("/api/minuta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ processo_id: processoId, tipo_minuta: tipo, instrucoes }),
    });
    const data = await resp.json();
    if (resp.ok) setMinuta(data.minuta);
    setLoading(false);
  }

  async function copiar() {
    if (!minuta) return;
    await navigator.clipboard.writeText(minuta);
    setCopiado(true); setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink-50 flex items-center gap-3">
          <FileEdit className="text-gold-400" size={28} /> Minuta Automática
        </h1>
        <p className="text-ink-400 mt-1 text-sm">Gere um rascunho de peça jurídica com base no processo analisado.</p>
      </div>

      <div className="card mb-6 space-y-4">
        <div>
          <label className="block text-sm text-ink-300 mb-1.5">Processo base</label>
          <select value={processoId} onChange={e => setProcessoId(e.target.value)} className="input-base">
            <option value="">Selecione um processo...</option>
            {processos.map(p => (
              <option key={p.id} value={p.id}>
                {p.analise?.numero_processo ?? p.nome_arquivo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-ink-300 mb-1.5">Tipo de peça</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)} className="input-base">
            {TIPOS_MINUTA.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-ink-300 mb-1.5">
            Instruções adicionais <span className="text-ink-600">(opcional)</span>
          </label>
          <textarea
            value={instrucoes} onChange={e => setInstrucoes(e.target.value)}
            placeholder="Ex: Focar no argumento de prescrição. Incluir jurisprudência do STJ."
            className="input-base min-h-[80px] resize-none"
          />
        </div>

        <button onClick={gerar} disabled={!processoId || loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <FileEdit size={18} />}
          {loading ? "Gerando minuta..." : `Gerar ${tipo}`}
        </button>
      </div>

      {loading && (
        <div className="card text-center py-12">
          <Loader2 size={32} className="text-gold-400 animate-spin mx-auto mb-3" />
          <p className="text-ink-300">Redigindo a minuta...</p>
          <p className="text-ink-500 text-sm mt-1">Pode levar até 60 segundos</p>
        </div>
      )}

      {minuta && (
        <div className="card border-gold-500/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg text-ink-50">{tipo}</h2>
            <button onClick={copiar} className="btn-secondary flex items-center gap-2 text-sm">
              {copiado ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar texto</>}
            </button>
          </div>
          <div className="
            bg-ink-900 rounded-xl p-6 max-h-[700px] overflow-y-auto
            text-ink-200 text-sm leading-relaxed
            [&_h1]:font-display [&_h1]:text-xl [&_h1]:text-ink-50 [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-center
            [&_h2]:font-semibold [&_h2]:text-ink-100 [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-xs
            [&_h3]:font-semibold [&_h3]:text-ink-100 [&_h3]:mb-2 [&_h3]:mt-4
            [&_p]:mb-4 [&_p]:leading-loose [&_p]:text-justify
            [&_strong]:text-ink-50 [&_strong]:font-semibold
            [&_ul]:list-disc [&_ul]:list-inside [&_ul]:mb-3 [&_ul]:space-y-1
            [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:mb-3 [&_ol]:space-y-1
            [&_li]:leading-relaxed
            [&_hr]:border-ink-700 [&_hr]:my-6
            [&_blockquote]:border-l-2 [&_blockquote]:border-gold-500/50 [&_blockquote]:pl-4 [&_blockquote]:text-ink-300 [&_blockquote]:my-3
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {minuta}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
