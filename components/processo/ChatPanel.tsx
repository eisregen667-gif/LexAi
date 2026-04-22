// components/processo/ChatPanel.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { AnaliseProcesso, MensagemChat } from "@/lib/types";
import {
  MessageSquare, Send, Loader2, Sparkles, ChevronRight
} from "lucide-react";

interface Mensagem {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  processoId: string;
  mensagensIniciais: MensagemChat[];
  analise: AnaliseProcesso;
}

// Sugestões de perguntas contextuais
const SUGESTOES = [
  "Qual foi a última decisão?",
  "Há algum prazo vencendo em breve?",
  "Quem são as partes do processo?",
  "Qual é o objeto da ação?",
  "Quais foram os pedidos do autor?",
  "Houve alguma liminar deferida?",
];

export default function ChatPanel({ processoId, mensagensIniciais, analise }: Props) {
  const [mensagens, setMensagens] = useState<Mensagem[]>(
    mensagensIniciais.map((m) => ({ role: m.role, content: m.content }))
  );
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [aberto,   setAberto]   = useState(true);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  // Scroll automático para última mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, loading]);

  async function enviarMensagem(texto?: string) {
    const pergunta = (texto ?? input).trim();
    if (!pergunta || loading) return;

    setInput("");
    setMensagens((prev) => [...prev, { role: "user", content: pergunta }]);
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          processo_id: processoId,
          mensagem:    pergunta,
          historico:   mensagens.slice(-10), // Últimas 10 mensagens para economizar tokens
        }),
      });

      const data = await resp.json();

      if (!resp.ok || data.erro) {
        throw new Error(data.erro ?? "Erro ao obter resposta.");
      }

      setMensagens((prev) => [...prev, { role: "assistant", content: data.resposta }]);
    } catch (err) {
      setMensagens((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ ${err instanceof Error ? err.message : "Erro inesperado. Tente novamente."}`,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  }

  // ── Versão colapsada ──────────────────────────────────────────────────────
  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gold-500 hover:bg-gold-400
                   text-ink-950 flex items-center justify-center shadow-lg
                   transition-all duration-200 glow-gold z-50"
      >
        <MessageSquare size={22} />
      </button>
    );
  }

  return (
    <aside className="w-80 shrink-0 border-l border-ink-800 bg-ink-900/40 flex flex-col">

      {/* Header do chat */}
      <div className="shrink-0 px-4 py-3 border-b border-ink-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gold-500/20 flex items-center justify-center">
            <Sparkles size={12} className="text-gold-400" />
          </div>
          <span className="text-sm font-medium text-ink-200">Assistente do Processo</span>
        </div>
        <button
          onClick={() => setAberto(false)}
          className="text-ink-600 hover:text-ink-400 transition-colors p-1"
          title="Minimizar chat"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-auto p-4 space-y-4">

        {/* Estado vazio — sugestões */}
        {mensagens.length === 0 && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={20} className="text-gold-400" />
              </div>
              <p className="text-ink-300 text-sm font-medium">Pergunte sobre o processo</p>
              <p className="text-ink-600 text-xs mt-1">
                Faço perguntas em linguagem natural
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-ink-600 text-xs uppercase tracking-widest px-1">Sugestões</p>
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => enviarMensagem(s)}
                  className="w-full text-left text-xs text-ink-400 hover:text-ink-200
                             bg-ink-800/50 hover:bg-ink-800 border border-ink-700/50 hover:border-ink-600
                             rounded-lg px-3 py-2.5 transition-all duration-150"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Histórico de mensagens */}
        {mensagens.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm
                ${msg.role === "user"
                  ? "bg-gold-500/15 border border-gold-500/20 text-ink-100 rounded-br-sm"
                  : "bg-ink-800 border border-ink-700 text-ink-200 rounded-bl-sm"}`}
            >
              {msg.role === "assistant" ? (
                <div className="prose-chat">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Digitando... */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-ink-800 border border-ink-700 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-ink-500">
                <Loader2 size={13} className="animate-spin" />
                <span className="text-xs">Analisando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 p-4 border-t border-ink-800">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre o processo..."
            disabled={loading}
            rows={1}
            className="flex-1 resize-none bg-ink-800 border border-ink-700 text-ink-100 text-sm
                       placeholder:text-ink-600 rounded-xl px-3 py-2.5 min-h-[42px] max-h-32
                       focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/20
                       disabled:opacity-50 transition-colors duration-200
                       scrollbar-thin scrollbar-track-ink-900 scrollbar-thumb-ink-700"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            onClick={() => enviarMensagem()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-ink-700
                       flex items-center justify-center text-ink-950 disabled:text-ink-600
                       transition-all duration-200 shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-ink-700 text-[10px] mt-2 text-center">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </aside>
  );
}
