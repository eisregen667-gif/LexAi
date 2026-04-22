// components/processo/ProcessoView.tsx
"use client";

import { useState }          from "react";
import type { ProcessoDB, MensagemChat } from "@/lib/types";
import ResumoTab   from "./ResumoTab";
import TimelineTab from "./TimelineTab";
import PrazosTab   from "./PrazosTab";
import ChatPanel   from "./ChatPanel";
import { FileText, Clock, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Aba = "resumo" | "timeline" | "prazos";

export default function ProcessoView({
  processo,
  mensagensIniciais,
}: {
  processo: ProcessoDB;
  mensagensIniciais: MensagemChat[];
}) {
  const [aba, setAba] = useState<Aba>("resumo");
  const analise = processo.analise;

  const numPrazosUrgentes = analise?.prazos?.filter(
    (p) => p.criticidade === "alta" && !p.cumprido
  ).length ?? 0;

  const abas: { key: Aba; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "resumo",   label: "Resumo",      icon: <FileText size={15} /> },
    { key: "timeline", label: "Linha do Tempo", icon: <Clock size={15} /> },
    {
      key: "prazos",
      label: "Prazos",
      icon: <AlertCircle size={15} />,
      badge: numPrazosUrgentes,
    },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <header className="shrink-0 border-b border-ink-800 bg-ink-900/50 px-6 py-4">
        <div className="flex items-start gap-4">
          <Link href="/processos" className="btn-ghost p-2 -ml-2 shrink-0 mt-0.5">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl text-ink-50 truncate">
              {analise.numero_processo ?? processo.nome_arquivo}
            </h1>
            <p className="text-ink-500 text-sm truncate mt-0.5">
              {[analise.tipo_acao, analise.vara, analise.comarca]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-1 mt-4">
          {abas.map((a) => (
            <button
              key={a.key}
              onClick={() => setAba(a.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative
                ${aba === a.key
                  ? "bg-ink-700 text-ink-50 shadow-sm"
                  : "text-ink-400 hover:text-ink-200 hover:bg-ink-800"}`}
            >
              {a.icon}
              {a.label}
              {(a.badge ?? 0) > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] flex items-center justify-center font-bold">
                  {a.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ── Body: conteúdo + chat ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Conteúdo da aba */}
        <div className="flex-1 overflow-auto p-6">
          {aba === "resumo"   && <ResumoTab   analise={analise} processoId={processo.id} />}
          {aba === "timeline" && <TimelineTab analise={analise} />}
          {aba === "prazos"   && <PrazosTab   analise={analise} processoId={processo.id} />}
        </div>

        {/* Chat lateral */}
        <ChatPanel
          processoId={processo.id}
          mensagensIniciais={mensagensIniciais}
          analise={analise}
        />
      </div>
    </div>
  );
}
