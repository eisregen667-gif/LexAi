// components/processo/ResumoTab.tsx
"use client";

import BotaoResumoCliente from "./BotaoResumoCliente";
import { useState }          from "react";
import type { AnaliseProcesso } from "@/lib/types";
import { formatarDataLonga, TIPO_PARTE_LABEL } from "@/lib/utils";
import {
  Users, Scale, ListChecks, Gavel,
  Info, Download, ChevronDown, ChevronUp, Loader2
} from "lucide-react";

interface Props {
  analise: AnaliseProcesso;
  processoId: string;
}

export default function ResumoTab({ analise, processoId }: Props) {
  const [exportando, setExportando] = useState(false);

  async function exportarPDF() {
    setExportando(true);
    try {
      const resp = await fetch(`/api/exportar/${processoId}`);
      if (!resp.ok) throw new Error("Erro ao exportar");
      const blob = await resp.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `resumo-processo-${processoId.slice(0, 8)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erro ao exportar PDF. Tente novamente.");
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5 animate-fade-in">

      {/* Ações */}
      <div className="flex justify-end">
        <button
          onClick={exportarPDF}
          disabled={exportando}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          {exportando
            ? <Loader2 size={14} className="animate-spin" />
            : <Download size={14} />}
          Exportar resumo PDF
        </button>
      </div>

      {/* Resumo executivo */}
      {analise.resumo_executivo && (
        <section className="card border-gold-500/20 bg-gold-500/5">
          <div className="flex items-center gap-2 mb-3">
            <Info size={15} className="text-gold-400" />
            <h2 className="font-display text-base text-gold-300">Resumo Executivo</h2>
          </div>
          <p className="text-ink-200 leading-relaxed text-sm">{analise.resumo_executivo}</p>
          {analise.observacoes && (
            <div className="mt-3 pt-3 border-t border-gold-500/10">
              <p className="text-warning text-xs font-medium mb-1">⚠ Pontos de atenção</p>
              <p className="text-ink-300 text-sm leading-relaxed">{analise.observacoes}</p>
            </div>
          )}
        </section>
      )}

      {/* Dados gerais */}
      <section className="card">
        <h2 className="font-display text-base text-ink-100 mb-4 flex items-center gap-2">
          <Scale size={15} className="text-gold-400" />
          Dados do Processo
        </h2>
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {[
            { label: "Número",          val: analise.numero_processo },
            { label: "Tipo de ação",    val: analise.tipo_acao },
            { label: "Vara",            val: analise.vara },
            { label: "Comarca",         val: analise.comarca },
            { label: "Tribunal",        val: analise.tribunal },
            { label: "Valor da causa",  val: analise.valor_causa },
            { label: "Distribuição",    val: formatarDataLonga(analise.data_distribuicao) },
            { label: "Assunto",         val: analise.assunto },
          ].map(({ label, val }) => val ? (
            <div key={label}>
              <dt className="text-ink-500 text-xs uppercase tracking-wide">{label}</dt>
              <dd className="text-ink-100 text-sm mt-0.5">{val}</dd>
            </div>
          ) : null)}
        </dl>
      </section>

      {/* Objeto */}
      {analise.objeto && (
        <section className="card">
          <h2 className="font-display text-base text-ink-100 mb-3 flex items-center gap-2">
            <Scale size={15} className="text-gold-400" />
            Objeto da Ação
          </h2>
          <p className="text-ink-200 text-sm leading-relaxed">{analise.objeto}</p>
        </section>
      )}

      {/* Partes */}
      {analise.partes?.length > 0 && (
        <section className="card">
          <h2 className="font-display text-base text-ink-100 mb-4 flex items-center gap-2">
            <Users size={15} className="text-gold-400" />
            Partes Envolvidas
          </h2>
          <div className="space-y-2">
            {analise.partes.map((parte, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-ink-700/50 last:border-0">
                <span className="badge bg-ink-700 text-ink-300 border border-ink-600 shrink-0">
                  {TIPO_PARTE_LABEL[parte.tipo] ?? parte.tipo}
                </span>
                <div className="min-w-0">
                  <p className="text-ink-100 text-sm font-medium">{parte.nome}</p>
                  {parte.cpf_cnpj && (
                    <p className="text-ink-500 text-xs">{parte.cpf_cnpj}</p>
                  )}
                  {parte.advogado && (
                    <p className="text-ink-500 text-xs">Adv: {parte.advogado}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pedidos */}
      {analise.pedidos?.length > 0 && (
        <section className="card">
          <h2 className="font-display text-base text-ink-100 mb-4 flex items-center gap-2">
            <ListChecks size={15} className="text-gold-400" />
            Pedidos ({analise.pedidos.length})
          </h2>
          <ul className="space-y-2">
            {analise.pedidos.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-ink-700 text-ink-400 text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-ink-200 text-sm leading-relaxed">{p.descricao}</p>
                  {p.tipo && (
                    <span className="badge bg-ink-800 text-ink-500 border border-ink-700 text-xs mt-1">
                      {p.tipo}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Decisões */}
      {analise.decisoes?.length > 0 && (
        <DecisoesList decisoes={analise.decisoes} />
      )}

    </div>
  );
}

// ── Decisões com colapso ─────────────────────────────────────────────────────

function DecisoesList({ decisoes }: { decisoes: AnaliseProcesso["decisoes"] }) {
  const [expandido, setExpandido] = useState(false);
  const visiveis = expandido ? decisoes : decisoes.slice(0, 3);

  return (
    <section className="card">
      <h2 className="font-display text-base text-ink-100 mb-4 flex items-center gap-2">
        <Gavel size={15} className="text-gold-400" />
        Decisões ({decisoes.length})
      </h2>
      <div className="space-y-3">
        {visiveis.map((d, i) => (
          <div key={i} className="border-l-2 border-ink-700 pl-4 py-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-ink-500 text-xs">{formatarDataLonga(d.data)}</span>
              <span className="badge bg-ink-800 text-ink-400 border border-ink-700 text-xs capitalize">
                {d.tipo}
              </span>
              {d.resultado && (
                <span className={`badge text-xs border ${
                  d.resultado.includes("defer")
                    ? "bg-success/10 text-success border-success/30"
                    : d.resultado.includes("indefe")
                    ? "bg-danger/10 text-danger border-danger/30"
                    : "bg-ink-800 text-ink-400 border-ink-700"
                }`}>
                  {d.resultado}
                </span>
              )}
            </div>
            <p className="text-ink-200 text-sm leading-relaxed">{d.descricao}</p>
          </div>
        ))}
      </div>
      {decisoes.length > 3 && (
        <button
          onClick={() => setExpandido((v) => !v)}
          className="mt-4 flex items-center gap-1 text-sm text-ink-400 hover:text-ink-200 transition-colors"
        >
          {expandido
            ? <><ChevronUp size={14} /> Mostrar menos</>
            : <><ChevronDown size={14} /> Ver todas as {decisoes.length} decisões</>}
        </button>
      )}
    </section>
  );
}
