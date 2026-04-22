"use client";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { GitCompare, Upload, Loader2, FileText } from "lucide-react";
import { arquivoParaBase64, formatarTamanho } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function CompararPage() {
  const [pdf1, setPdf1] = useState<File | null>(null);
  const [pdf2, setPdf2] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const drop1 = useDropzone({ onDrop: f => setPdf1(f[0]), accept: { "application/pdf": [".pdf"] }, maxFiles: 1 });
  const drop2 = useDropzone({ onDrop: f => setPdf2(f[0]), accept: { "application/pdf": [".pdf"] }, maxFiles: 1 });

  async function comparar() {
    if (!pdf1 || !pdf2) return;
    setLoading(true); setErro(null); setResultado(null);
    try {
      const [b1, b2] = await Promise.all([arquivoParaBase64(pdf1), arquivoParaBase64(pdf2)]);
      const resp = await fetch("/api/comparar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdf1: b1, pdf2: b2, nome1: pdf1.name, nome2: pdf2.name }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.erro);
      setResultado(data.analise);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao comparar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink-50 flex items-center gap-3">
          <GitCompare className="text-gold-400" size={28} /> Comparar Processos
        </h1>
        <p className="text-ink-400 mt-1 text-sm">A IA identifica semelhanças, contradições e pontos críticos entre dois processos.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        {[
          { drop: drop1, file: pdf1, label: "Processo 1" },
          { drop: drop2, file: pdf2, label: "Processo 2" }
        ].map(({ drop, file, label }) => (
          <div key={label} {...drop.getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${drop.isDragActive ? "border-gold-500 bg-gold-500/5" : file ? "border-gold-500/40 bg-gold-500/5" : "border-ink-700 hover:border-ink-600"}`}>
            <input {...drop.getInputProps()} />
            {file ? (
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-gold-400 shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-ink-100 text-sm font-medium truncate">{file.name}</p>
                  <p className="text-ink-500 text-xs">{formatarTamanho(file.size)}</p>
                </div>
              </div>
            ) : (
              <div>
                <Upload size={24} className="text-ink-600 mx-auto mb-2" />
                <p className="text-ink-300 text-sm font-medium">{label}</p>
                <p className="text-ink-600 text-xs mt-1">Arraste ou clique</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {erro && <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 text-sm mb-4">{erro}</div>}

      {pdf1 && pdf2 && !loading && (
        <button onClick={comparar} className="btn-primary w-full py-3 flex items-center justify-center gap-2 mb-6">
          <GitCompare size={18} /> Comparar os dois processos
        </button>
      )}

      {loading && (
        <div className="card text-center py-12">
          <Loader2 size={32} className="text-gold-400 animate-spin mx-auto mb-3" />
          <p className="text-ink-300">Analisando e comparando os dois processos...</p>
          <p className="text-ink-500 text-sm mt-1">Pode levar até 60 segundos</p>
        </div>
      )}

      {resultado && (
        <div className="card border-gold-500/20">
          <h2 className="font-display text-lg text-ink-50 mb-6 flex items-center gap-2">
            <GitCompare size={16} className="text-gold-400" /> Análise Comparativa
          </h2>
          <div className="
            text-ink-200 text-sm leading-relaxed
            [&_h1]:font-display [&_h1]:text-xl [&_h1]:text-ink-50 [&_h1]:mb-4 [&_h1]:mt-6
            [&_h2]:font-display [&_h2]:text-lg [&_h2]:text-ink-100 [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-ink-700
            [&_h3]:font-semibold [&_h3]:text-ink-100 [&_h3]:mb-2 [&_h3]:mt-4
            [&_h4]:font-semibold [&_h4]:text-gold-400 [&_h4]:mb-2 [&_h4]:mt-4
            [&_p]:mb-3 [&_p]:leading-relaxed
            [&_strong]:text-ink-50 [&_strong]:font-semibold
            [&_ul]:list-disc [&_ul]:list-inside [&_ul]:mb-3 [&_ul]:space-y-1
            [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:mb-3 [&_ol]:space-y-1
            [&_li]:text-ink-200 [&_li]:leading-relaxed
            [&_blockquote]:border-l-2 [&_blockquote]:border-gold-500/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-ink-300 [&_blockquote]:my-3
            [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
            [&_th]:text-left [&_th]:text-ink-100 [&_th]:font-semibold [&_th]:px-3 [&_th]:py-2 [&_th]:bg-ink-800 [&_th]:border [&_th]:border-ink-700 [&_th]:text-xs
            [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-ink-700 [&_td]:text-ink-200 [&_td]:text-xs [&_td]:align-top
            [&_tr:nth-child(even)_td]:bg-ink-900/50
            [&_hr]:border-ink-700 [&_hr]:my-6
            [&_code]:bg-ink-900 [&_code]:text-gold-300 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {resultado}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
