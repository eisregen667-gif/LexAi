"use client";
import { useState } from "react";
import { Users, Loader2, Copy, Check } from "lucide-react";

export default function BotaoResumoCliente({ processoId }: { processoId: string }) {
  const [loading, setLoading]   = useState(false);
  const [texto, setTexto]       = useState<string | null>(null);
  const [copiado, setCopiado]   = useState(false);
  const [erro, setErro]         = useState<string | null>(null);

  async function gerar() {
    setLoading(true); setErro(null);
    const resp = await fetch("/api/resumo-cliente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ processo_id: processoId }),
    });
    const data = await resp.json();
    if (!resp.ok) { setErro(data.erro); setLoading(false); return; }
    setTexto(data.texto);
    setLoading(false);
  }

  async function copiar() {
    if (!texto) return;
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="mt-4">
      {!texto ? (
        <button onClick={gerar} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
          {loading ? "Gerando resumo para cliente..." : "Gerar resumo para o cliente"}
        </button>
      ) : (
        <div className="card border-gold-500/20 bg-gold-500/5 mt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-gold-400" />
              <h3 className="text-gold-300 text-sm font-medium">Resumo para o cliente</h3>
            </div>
            <button onClick={copiar} className="btn-ghost flex items-center gap-1 text-xs py-1 px-2">
              {copiado ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
            </button>
          </div>
          <p className="text-ink-200 text-sm leading-relaxed whitespace-pre-wrap">{texto}</p>
          <button onClick={() => setTexto(null)} className="text-ink-600 text-xs mt-3 hover:text-ink-400">
            Gerar novamente
          </button>
        </div>
      )}
      {erro && <p className="text-danger text-sm mt-2">{erro}</p>}
    </div>
  );
}
