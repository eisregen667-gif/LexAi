"use client";
import { useState } from "react";
import { Check, Zap, Crown, Loader2 } from "lucide-react";
import { useAssinatura } from "@/lib/useAssinatura";

const RECURSOS_BASICO = [
  "30 análises de processo por mês",
  "Resumo estruturado completo",
  "Linha do tempo dos eventos",
  "Controle de prazos com alertas",
  "Chat com o processo (20 perguntas)",
  "Alertas de prazo por e-mail",
  "Histórico de processos",
  "Exportar resumo em texto",
];

const RECURSOS_PRO = [
  "Análises ilimitadas",
  "Chat ilimitado com o processo",
  "Minuta automática (contestação, recursos...)",
  "Comparar dois processos",
  "Resumo para o cliente em linguagem simples",
  "Painel completo do escritório",
  "Exportar resumo em PDF formatado",
  "Suporte prioritário",
  "Acesso antecipado a novidades",
];

export default function PlanosPage() {
  const { assinatura } = useAssinatura();
  const [loadingBasico, setLoadingBasico] = useState(false);
  const [loadingPro,    setLoadingPro]    = useState(false);
  const [periodo, setPeriodo] = useState<"mensal" | "anual">("mensal");

  const planoAtual = assinatura?.plano ?? "gratuito";

  async function assinar(plano: "basico" | "pro") {
    plano === "basico" ? setLoadingBasico(true) : setLoadingPro(true);
    const resp = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plano, periodo }),
    });
    const data = await resp.json();
    if (data.url) window.location.href = data.url;
    plano === "basico" ? setLoadingBasico(false) : setLoadingPro(false);
  }

  async function abrirPortal() {
    const resp = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await resp.json();
    if (data.url) window.location.href = data.url;
  }

  const precoBasico = periodo === "anual" ? 77 : 97;
  const precoPro    = periodo === "anual" ? 157 : 197;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl text-ink-50 mb-3">Planos e Preços</h1>
        <p className="text-ink-400">Cancele quando quiser. Sem fidelidade.</p>

        {/* Toggle mensal/anual */}
        <div className="inline-flex items-center gap-3 mt-6 bg-ink-900 border border-ink-700 rounded-xl p-1">
          <button
            onClick={() => setPeriodo("mensal")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${periodo === "mensal" ? "bg-ink-700 text-ink-50" : "text-ink-400 hover:text-ink-200"}`}
          >
            Mensal
          </button>
          <button
            onClick={() => setPeriodo("anual")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
              ${periodo === "anual" ? "bg-ink-700 text-ink-50" : "text-ink-400 hover:text-ink-200"}`}
          >
            Anual
            <span className="badge bg-success/20 text-success border border-success/30 text-xs">-20%</span>
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">

        {/* Básico */}
        <div className={`card flex flex-col ${planoAtual === "basico" ? "border-gold-500/40" : ""}`}>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} className="text-ink-400" />
              <p className="text-ink-300 font-medium">Básico</p>
              {planoAtual === "basico" && (
                <span className="badge bg-gold-500/10 text-gold-400 border border-gold-500/20 text-xs ml-auto">
                  Plano atual
                </span>
              )}
            </div>
            <p className="font-display text-4xl text-ink-50">
              R$ {precoBasico}
              <span className="text-base text-ink-400 font-sans font-normal">/mês</span>
            </p>
            {periodo === "anual" && (
              <p className="text-ink-500 text-xs mt-1">Cobrado R$ {precoBasico * 12}/ano</p>
            )}
          </div>

          <ul className="space-y-2.5 flex-1 mb-6">
            {RECURSOS_BASICO.map(r => (
              <li key={r} className="flex items-start gap-2 text-sm text-ink-300">
                <Check size={14} className="text-gold-400 shrink-0 mt-0.5" />
                {r}
              </li>
            ))}
          </ul>

          {planoAtual === "basico" ? (
            <button onClick={abrirPortal} className="btn-secondary w-full">
              Gerenciar assinatura
            </button>
          ) : planoAtual === "pro" ? (
            <button className="btn-secondary w-full opacity-50 cursor-not-allowed" disabled>
              Downgrade disponível no portal
            </button>
          ) : (
            <button onClick={() => assinar("basico")} disabled={loadingBasico}
              className="btn-secondary w-full flex items-center justify-center gap-2">
              {loadingBasico ? <Loader2 size={16} className="animate-spin" /> : null}
              {loadingBasico ? "Redirecionando..." : "Assinar Básico"}
            </button>
          )}
        </div>

        {/* Pro */}
        <div className={`card flex flex-col border-gold-500/40 relative overflow-hidden
          ${planoAtual === "pro" ? "bg-gold-500/5" : ""}`}>
          <div className="absolute top-3 right-3 badge bg-gold-500/20 text-gold-400 border border-gold-500/30 text-xs">
            ⭐ Mais popular
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Crown size={18} className="text-gold-400" />
              <p className="text-gold-300 font-medium">Pro</p>
              {planoAtual === "pro" && (
                <span className="badge bg-gold-500/10 text-gold-400 border border-gold-500/20 text-xs ml-auto">
                  Plano atual
                </span>
              )}
            </div>
            <p className="font-display text-4xl text-ink-50">
              R$ {precoPro}
              <span className="text-base text-ink-400 font-sans font-normal">/mês</span>
            </p>
            {periodo === "anual" && (
              <p className="text-ink-500 text-xs mt-1">Cobrado R$ {precoPro * 12}/ano</p>
            )}
          </div>

          <ul className="space-y-2.5 flex-1 mb-6">
            {RECURSOS_PRO.map(r => (
              <li key={r} className="flex items-start gap-2 text-sm text-ink-300">
                <Check size={14} className="text-gold-400 shrink-0 mt-0.5" />
                {r}
              </li>
            ))}
          </ul>

          {planoAtual === "pro" ? (
            <button onClick={abrirPortal} className="btn-secondary w-full">
              Gerenciar assinatura
            </button>
          ) : (
            <button onClick={() => assinar("pro")} disabled={loadingPro}
              className="btn-primary w-full flex items-center justify-center gap-2 glow-gold">
              {loadingPro ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} />}
              {loadingPro ? "Redirecionando..." : "Assinar Pro"}
            </button>
          )}
        </div>
      </div>

      {/* Pix */}
      <div className="card mt-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 text-2xl">
          💠
        </div>
        <div className="flex-1">
          <p className="text-ink-100 font-medium">Prefere pagar via Pix?</p>
          <p className="text-ink-500 text-sm mt-0.5">
            Entre em contato pelo WhatsApp para pagamento manual via Pix.
          </p>
        </div>
        <a href="https://wa.me/5511999999999?text=Olá! Quero assinar o LexIA via Pix."
          target="_blank"
          className="btn-secondary text-sm shrink-0 flex items-center gap-2">
          💬 WhatsApp
        </a>
      </div>

      {/* Garantia */}
      <p className="text-center text-ink-600 text-xs mt-6">
        ✓ Cancele quando quiser · ✓ Sem taxa de cancelamento · ✓ Reembolso em 7 dias
      </p>
    </div>
  );
}
