"use client";

import { useState } from "react";
import type { AnaliseProcesso, Prazo } from "@/lib/types";
import { formatarData } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, CheckCircle2, Clock, CalendarClock } from "lucide-react";

interface Props {
  analise: AnaliseProcesso;
  processoId: string;
}

const CRITICIDADE_COR: Record<string, string> = {
  alta:  "text-red-400 border-red-400/40 bg-red-400/10",
  media: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
  baixa: "text-gold-400 border-gold-500/40 bg-gold-500/10",
};

export default function PrazosTab({ analise, processoId }: Props) {
  const [prazos, setPrazos] = useState<Prazo[]>(
    (analise.prazos ?? []).filter(p => p && p.data_limite)
  );
  const supabase = createClient();

  const pendentes = prazos.filter(p => !p.cumprido);
  const cumpridos = prazos.filter(p => p.cumprido);

  async function toggleCumprido(idx: number) {
    const novos = prazos.map((p, i) => i === idx ? { ...p, cumprido: !p.cumprido } : p);
    setPrazos(novos);
    await supabase.from("processos").update({ analise: { ...analise, prazos: novos } }).eq("id", processoId);
  }

  if (prazos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CalendarClock size={36} className="text-ink-700 mb-4" />
        <p className="text-ink-400">Nenhum prazo identificado neste processo.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="card-sm text-center">
          <p className="font-display text-2xl text-ink-50">{prazos.length}</p>
          <p className="text-ink-500 text-xs mt-1">Total</p>
        </div>
        <div className="card-sm text-center">
          <p className="font-display text-2xl text-yellow-400">{pendentes.length}</p>
          <p className="text-ink-500 text-xs mt-1">Pendentes</p>
        </div>
        <div className="card-sm text-center">
          <p className="font-display text-2xl text-green-400">{cumpridos.length}</p>
          <p className="text-ink-500 text-xs mt-1">Cumpridos</p>
        </div>
      </div>

      {pendentes.length > 0 && (
        <section>
          <h3 className="text-ink-400 text-xs uppercase tracking-widest mb-3">Pendentes</h3>
          <div className="space-y-3">
            {[...pendentes]
              .sort((a, b) => (a.data_limite ?? "").localeCompare(b.data_limite ?? ""))
              .map((prazo) => (
                <PrazoCard key={prazos.indexOf(prazo)} prazo={prazo} idx={prazos.indexOf(prazo)} onToggle={toggleCumprido} />
              ))}
          </div>
        </section>
      )}

      {cumpridos.length > 0 && (
        <section>
          <h3 className="text-ink-400 text-xs uppercase tracking-widest mb-3">Cumpridos</h3>
          <div className="space-y-2 opacity-60">
            {cumpridos.map((prazo) => (
              <PrazoCard key={prazos.indexOf(prazo)} prazo={prazo} idx={prazos.indexOf(prazo)} onToggle={toggleCumprido} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PrazoCard({ prazo, idx, onToggle }: { prazo: Prazo; idx: number; onToggle: (i: number) => void }) {
  const cor = CRITICIDADE_COR[prazo.criticidade ?? "baixa"] ?? CRITICIDADE_COR.baixa;
  return (
    <div className={`card-sm flex items-start gap-4 ${prazo.cumprido ? "opacity-60" : ""}`}>
      <button
        onClick={() => onToggle(idx)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors
          ${prazo.cumprido ? "bg-green-500 border-green-500 text-white" : "border-ink-600 hover:border-gold-500"}`}
      >
        {prazo.cumprido && <CheckCircle2 size={12} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-relaxed ${prazo.cumprido ? "line-through text-ink-500" : "text-ink-100"}`}>
          {prazo.descricao}
        </p>
        {prazo.responsavel && <p className="text-ink-500 text-xs mt-0.5">Responsável: {prazo.responsavel}</p>}
        <div className="flex items-center gap-2 mt-1">
          <Clock size={11} className="text-ink-500" />
          <span className="text-ink-500 text-xs">{formatarData(prazo.data_limite)}</span>
        </div>
      </div>
      {!prazo.cumprido && (
        <span className={`badge border text-xs shrink-0 ${cor}`}>
          {prazo.criticidade === "alta" && <AlertTriangle size={10} className="mr-0.5" />}
          {prazo.criticidade ?? "baixa"}
        </span>
      )}
    </div>
  );
}
