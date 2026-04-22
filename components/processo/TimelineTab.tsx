// components/processo/TimelineTab.tsx
"use client";

import type { AnaliseProcesso } from "@/lib/types";
import { formatarData, formatarDataLonga } from "@/lib/utils";
import { Calendar } from "lucide-react";

const TIPO_COR: Record<string, string> = {
  petição:               "bg-blue-500/20 border-blue-500/40 text-blue-300",
  despacho:              "bg-ink-700 border-ink-600 text-ink-300",
  decisão:               "bg-gold-500/15 border-gold-500/40 text-gold-300",
  "decisão interlocutória": "bg-gold-500/15 border-gold-500/40 text-gold-300",
  sentença:              "bg-purple-500/15 border-purple-500/40 text-purple-300",
  acórdão:               "bg-purple-500/20 border-purple-500/50 text-purple-200",
  liminar:               "bg-orange-500/15 border-orange-500/40 text-orange-300",
  juntada:               "bg-ink-700 border-ink-600 text-ink-400",
  audiência:             "bg-cyan-500/15 border-cyan-500/40 text-cyan-300",
  recurso:               "bg-red-500/15 border-red-500/40 text-red-300",
  default:               "bg-ink-700 border-ink-600 text-ink-400",
};

function corDoTipo(tipo: string): string {
  const chave = tipo.toLowerCase();
  return TIPO_COR[chave] ?? TIPO_COR.default;
}

export default function TimelineTab({ analise }: { analise: AnaliseProcesso }) {
  const eventos = analise.timeline ?? [];

  if (eventos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Calendar size={36} className="text-ink-700 mb-4" />
        <p className="text-ink-400">Nenhum evento identificado na linha do tempo.</p>
      </div>
    );
  }

  // Agrupar por ano/mês para melhor visualização
  const grupos = eventos.reduce<Record<string, typeof eventos>>((acc, ev) => {
    const chave = ev.data ? ev.data.slice(0, 7) : "sem-data"; // YYYY-MM
    if (!acc[chave]) acc[chave] = [];
    acc[chave].push(ev);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl animate-fade-in">
      <p className="text-ink-500 text-sm mb-6">
        {eventos.length} evento{eventos.length !== 1 ? "s" : ""} · mais recente no final
      </p>

      <div className="space-y-8">
        {Object.entries(grupos).map(([mesCHave, evs]) => {
          // Formatar cabeçalho do grupo
          let labelMes = mesCHave;
          try {
            const d = new Date(mesCHave + "-01");
            labelMes = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
            labelMes = labelMes.charAt(0).toUpperCase() + labelMes.slice(1);
          } catch { /* manter original */ }

          return (
            <div key={mesCHave}>
              {/* Cabeçalho do mês */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-ink-500 uppercase tracking-widest">
                  {labelMes}
                </span>
                <div className="flex-1 h-px bg-ink-800" />
              </div>

              {/* Eventos do mês */}
              <div className="space-y-0">
                {evs.map((ev, i) => (
                  <div key={i} className="flex gap-4 group">
                    {/* Linha vertical + bolinha */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-gold-500/60 border-2 border-gold-500/30 shrink-0 mt-1.5 group-hover:bg-gold-400 transition-colors" />
                      {i < evs.length - 1 && (
                        <div className="w-px flex-1 bg-ink-800 mt-1" />
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 pb-5">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-ink-500 text-xs">
                          {formatarData(ev.data)}
                        </span>
                        <span className={`badge border text-xs ${corDoTipo(ev.tipo)}`}>
                          {ev.tipo}
                        </span>
                        {ev.autor && (
                          <span className="text-ink-600 text-xs">por {ev.autor}</span>
                        )}
                      </div>
                      <p className="text-ink-200 text-sm leading-relaxed">
                        {ev.descricao}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
