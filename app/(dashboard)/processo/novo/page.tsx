// app/(dashboard)/processo/novo/page.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter }             from "next/navigation";
import { useDropzone }           from "react-dropzone";
import {
  Upload, FileText, X, Loader2, AlertCircle,
  CheckCircle2, Zap
} from "lucide-react";
import { createClient }      from "@/lib/supabase/client";
import { arquivoParaBase64, formatarTamanho } from "@/lib/utils";

const MAX_SIZE_BYTES = 32 * 1024 * 1024; // 32MB

type Stage = "idle" | "uploading" | "analyzing" | "done" | "error";

export default function NovoProcessoPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [arquivo,   setArquivo]   = useState<File | null>(null);
  const [stage,     setStage]     = useState<Stage>("idle");
  const [progresso, setProgresso] = useState(0);
  const [erro,      setErro]      = useState<string | null>(null);

  // ── Dropzone ──────────────────────────────────────────────────────────────
  const onDrop = useCallback((accepted: File[], rejected: { errors: { message: string }[] }[]) => {
    if (rejected.length > 0) {
      const msg = rejected[0].errors[0].message;
      if (msg.includes("File is larger than"))
        setErro("Arquivo muito grande. Máximo permitido: 32MB.");
      else if (msg.includes("file-invalid-type"))
        setErro("Apenas arquivos PDF são aceitos.");
      else
        setErro("Arquivo inválido. Verifique o tipo e o tamanho.");
      return;
    }
    setErro(null);
    setArquivo(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:   { "application/pdf": [".pdf"] },
    maxFiles:  1,
    maxSize:   MAX_SIZE_BYTES,
    disabled:  stage !== "idle",
  });

  // ── Fluxo de análise ─────────────────────────────────────────────────────
  async function handleAnalisar() {
    if (!arquivo) return;
    setErro(null);

    try {
      // 1. Autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada. Faça login novamente.");

      // 2. Upload para Supabase Storage
      setStage("uploading");
      setProgresso(10);

      const storagePath = `${user.id}/${Date.now()}_${arquivo.name}`;
      const { error: uploadError } = await supabase.storage
        .from("processos-pdf")
        .upload(storagePath, arquivo, { contentType: "application/pdf", upsert: false });

      if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);
      setProgresso(35);

      // 3. Criar registro no banco com status "analisando"
      const { data: processoDb, error: dbError } = await supabase
        .from("processos")
        .insert({
          user_id:      user.id,
          nome_arquivo: arquivo.name,
          storage_path: storagePath,
          status:       "analisando",
        })
        .select()
        .single();

      if (dbError) throw new Error(`Erro ao criar registro: ${dbError.message}`);
      setProgresso(50);

      // 4. Converter PDF para base64 e enviar para API de análise
      setStage("analyzing");
      setProgresso(60);

      const base64 = await arquivoParaBase64(arquivo);
      setProgresso(70);

      const resp = await fetch("/api/analisar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ processo_id: processoDb.id, pdf_base64: base64 }),
      });

      const resultado = await resp.json();

      if (!resp.ok || !resultado.sucesso) {
        throw new Error(resultado.erro ?? "Falha na análise do processo.");
      }

      setProgresso(100);
      setStage("done");

      // 5. Redirecionar para a página de resultado
      setTimeout(() => {
        router.push(`/processo/${processoDb.id}`);
      }, 800);

    } catch (err) {
      console.error(err);
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
      setStage("error");
      setProgresso(0);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const isLoading = stage === "uploading" || stage === "analyzing";

  return (
    <div className="p-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink-50">Novo Processo</h1>
        <p className="text-ink-400 mt-1 text-sm">
          Faça upload do PDF e a IA extrai tudo em ~30 segundos.
        </p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center
          transition-all duration-300 cursor-pointer
          ${isDragActive
            ? "border-gold-500 bg-gold-500/5 scale-[1.02]"
            : arquivo
            ? "border-gold-500/40 bg-gold-500/5"
            : "border-ink-700 hover:border-ink-600 hover:bg-ink-800/50 bg-ink-900/30"}
          ${isLoading || stage === "done" ? "pointer-events-none" : ""}
        `}
      >
        <input {...getInputProps()} />

        {/* Estado: sem arquivo */}
        {!arquivo && (
          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
                             ${isDragActive ? "bg-gold-500/20 border border-gold-500/40" : "bg-ink-800 border border-ink-700"}`}>
              <Upload size={28} className={isDragActive ? "text-gold-400" : "text-ink-500"} />
            </div>
            <div>
              <p className="text-ink-200 font-medium">
                {isDragActive ? "Solte o arquivo aqui" : "Arraste o PDF ou clique para selecionar"}
              </p>
              <p className="text-ink-500 text-sm mt-1">
                Suporta PDFs até 32MB · até 100 páginas
              </p>
            </div>
          </div>
        )}

        {/* Estado: arquivo selecionado */}
        {arquivo && !isLoading && stage !== "done" && (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center shrink-0">
              <FileText size={22} className="text-gold-400" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-ink-100 font-medium truncate">{arquivo.name}</p>
              <p className="text-ink-500 text-sm">{formatarTamanho(arquivo.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setArquivo(null); }}
              className="w-8 h-8 rounded-lg hover:bg-ink-700 flex items-center justify-center text-ink-500 hover:text-ink-200 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Estado: carregando */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
              <Loader2 size={28} className="text-gold-400 animate-spin" />
            </div>
            <div>
              <p className="text-ink-200 font-medium">
                {stage === "uploading" ? "Enviando arquivo..." : "Analisando com IA..."}
              </p>
              <p className="text-ink-500 text-sm mt-1">
                {stage === "analyzing"
                  ? "A Claude está lendo o processo. Isso pode levar até 60 segundos."
                  : "Fazendo upload seguro..."}
              </p>
            </div>
            {/* Barra de progresso */}
            <div className="w-full max-w-xs bg-ink-800 rounded-full h-1.5">
              <div
                className="bg-gold-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        )}

        {/* Estado: concluído */}
        {stage === "done" && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-success" />
            </div>
            <p className="text-ink-100 font-medium">Análise concluída! Redirecionando...</p>
          </div>
        )}
      </div>

      {/* Erro */}
      {erro && (
        <div className="mt-4 flex items-start gap-3 bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{erro}</span>
        </div>
      )}

      {/* Botão de análise */}
      {arquivo && !isLoading && stage !== "done" && (
        <button
          onClick={handleAnalisar}
          className="btn-primary w-full mt-6 flex items-center justify-center gap-2 text-base py-3 glow-gold"
        >
          <Zap size={18} />
          Analisar processo
        </button>
      )}

      {/* Info dicas */}
      {!arquivo && !isLoading && (
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {[
            { icon: "🔒", title: "Privado por padrão", desc: "Seu PDF nunca é compartilhado." },
            { icon: "⚡", title: "Resultado em ~30s", desc: "Powered by Claude da Anthropic." },
            { icon: "📄", title: "PDFs de até 100 pgs", desc: "Suporta processos extensos." },
          ].map((d) => (
            <div key={d.title} className="card-sm text-center">
              <div className="text-2xl mb-2">{d.icon}</div>
              <p className="text-ink-200 text-sm font-medium">{d.title}</p>
              <p className="text-ink-600 text-xs mt-0.5">{d.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
