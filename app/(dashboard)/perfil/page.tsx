"use client";
import { useState, useEffect } from "react";
import { User, Lock, Phone, Award, Check, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAssinatura } from "@/lib/useAssinatura";
import Link from "next/link";
import { PLANOS } from "@/lib/planos";

export default function PerfilPage() {
  const supabase = createClient();
  const { assinatura } = useAssinatura();

  const [nome,     setNome]     = useState("");
  const [oab,      setOab]      = useState("");
  const [telefone, setTelefone] = useState("");
  const [senhaAtual,  setSenhaAtual]  = useState("");
  const [novaSenha,   setNovaSenha]   = useState("");
  const [confirma,    setConfirma]    = useState("");

  const [salvando,  setSalvando]  = useState(false);
  const [trocando,  setTrocando]  = useState(false);
  const [sucesso,   setSucesso]   = useState<string | null>(null);
  const [erro,      setErro]      = useState<string | null>(null);
  const [email,     setEmail]     = useState("");

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      setNome(user.user_metadata?.nome_completo ?? "");
      setOab(user.user_metadata?.oab ?? "");
      setTelefone(user.user_metadata?.telefone ?? "");
    }
    carregar();
  }, []);

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true); setErro(null); setSucesso(null);
    const { error } = await supabase.auth.updateUser({
      data: { nome_completo: nome, oab, telefone }
    });
    setSalvando(false);
    if (error) { setErro("Erro ao salvar: " + error.message); return; }
    setSucesso("perfil");
    setTimeout(() => setSucesso(null), 3000);
  }

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (novaSenha !== confirma) { setErro("As senhas não coincidem."); return; }
    if (novaSenha.length < 8)  { setErro("Senha deve ter pelo menos 8 caracteres."); return; }
    setTrocando(true); setErro(null); setSucesso(null);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setTrocando(false);
    if (error) { setErro("Erro ao trocar senha: " + error.message); return; }
    setSucesso("senha");
    setSenhaAtual(""); setNovaSenha(""); setConfirma("");
    setTimeout(() => setSucesso(null), 3000);
  }

  const planoAtual = assinatura?.plano ?? "gratuito";
  const infoPlano  = PLANOS[planoAtual];

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink-50">Minha Conta</h1>
        <p className="text-ink-400 mt-1 text-sm">Gerencie seus dados e assinatura</p>
      </div>

      {/* Card do plano atual */}
      <div className={`card flex items-center justify-between
        ${planoAtual === "pro" ? "border-gold-500/40 bg-gold-500/5" : "border-ink-700"}`}>
        <div>
          <p className="text-ink-400 text-xs uppercase tracking-widest mb-1">Plano atual</p>
          <p className={`font-display text-2xl font-bold
            ${planoAtual === "pro" ? "text-gold-400" : planoAtual === "basico" ? "text-ink-100" : "text-ink-400"}`}>
            {infoPlano.nome}
            {planoAtual !== "gratuito" && (
              <span className="text-ink-400 font-sans font-normal text-base ml-2">
                R$ {infoPlano.preco}/mês
              </span>
            )}
          </p>
          {assinatura && planoAtual === "basico" && (
            <p className="text-ink-500 text-xs mt-1">
              {assinatura.analises_mes_atual}/{assinatura.limite_analises} análises usadas este mês
            </p>
          )}
          {planoAtual === "gratuito" && (
            <p className="text-ink-500 text-xs mt-1">
              {assinatura?.analises_mes_atual ?? 0}/3 análises gratuitas usadas
            </p>
          )}
        </div>
        <Link href="/planos" className={planoAtual === "pro" ? "btn-secondary text-sm" : "btn-primary text-sm"}>
          {planoAtual === "pro" ? "Gerenciar plano" : "Fazer upgrade"}
        </Link>
      </div>

      {/* Dados do perfil */}
      <div className="card">
        <h2 className="font-display text-lg text-ink-50 mb-5 flex items-center gap-2">
          <User size={16} className="text-gold-400" /> Dados pessoais
        </h2>
        <form onSubmit={salvarPerfil} className="space-y-4">
          <div>
            <label className="block text-sm text-ink-300 mb-1.5">E-mail</label>
            <input type="email" className="input-base opacity-50 cursor-not-allowed" value={email} disabled />
            <p className="text-ink-600 text-xs mt-1">O e-mail não pode ser alterado.</p>
          </div>
          <div>
            <label className="block text-sm text-ink-300 mb-1.5">Nome completo</label>
            <input type="text" className="input-base" placeholder="Dr. João Silva"
              value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-300 mb-1.5 flex items-center gap-1">
                <Award size={12} /> OAB
              </label>
              <input type="text" className="input-base" placeholder="SP 123456"
                value={oab} onChange={e => setOab(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-ink-300 mb-1.5 flex items-center gap-1">
                <Phone size={12} /> WhatsApp
              </label>
              <input type="tel" className="input-base" placeholder="(11) 99999-9999"
                value={telefone} onChange={e => setTelefone(e.target.value)} />
            </div>
          </div>

          {sucesso === "perfil" && (
            <div className="flex items-center gap-2 text-success text-sm">
              <Check size={14} /> Dados salvos com sucesso!
            </div>
          )}

          <button type="submit" disabled={salvando} className="btn-primary flex items-center gap-2">
            {salvando ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {salvando ? "Salvando..." : "Salvar dados"}
          </button>
        </form>
      </div>

      {/* Trocar senha */}
      <div className="card">
        <h2 className="font-display text-lg text-ink-50 mb-5 flex items-center gap-2">
          <Lock size={16} className="text-gold-400" /> Trocar senha
        </h2>
        <form onSubmit={trocarSenha} className="space-y-4">
          <div>
            <label className="block text-sm text-ink-300 mb-1.5">Nova senha</label>
            <input type="password" className="input-base" placeholder="Mínimo 8 caracteres"
              value={novaSenha} onChange={e => setNovaSenha(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-ink-300 mb-1.5">Confirmar nova senha</label>
            <input type="password" className="input-base" placeholder="Repita a senha"
              value={confirma} onChange={e => setConfirma(e.target.value)} required />
          </div>

          {erro && (
            <div className="flex items-center gap-2 text-danger text-sm">
              <AlertCircle size={14} /> {erro}
            </div>
          )}
          {sucesso === "senha" && (
            <div className="flex items-center gap-2 text-success text-sm">
              <Check size={14} /> Senha alterada com sucesso!
            </div>
          )}

          <button type="submit" disabled={trocando} className="btn-secondary flex items-center gap-2">
            {trocando ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
            {trocando ? "Alterando..." : "Alterar senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
