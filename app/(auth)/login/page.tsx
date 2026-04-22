export const dynamic = 'force-dynamic'

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Scale, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router   = useRouter();
  const params   = useSearchParams();
  const supabase = createClient();

  const [email,   setEmail]   = useState("");
  const [senha,   setSenha]   = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro,    setErro]    = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) { setErro(traduzirErro(error.message)); setLoading(false); return; }
    router.push("/processos");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-ink-950 bg-texture flex items-center justify-center px-6">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
              <Scale size={18} className="text-gold-400" />
            </div>
            <span className="font-display text-2xl font-semibold text-ink-50">Lex<span className="text-gold-400">IA</span></span>
          </Link>
          <h1 className="font-display text-3xl text-ink-50">Bem-vindo de volta</h1>
          <p className="text-ink-400 mt-2 text-sm">Entre na sua conta para continuar</p>
        </div>
        <div className="card">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-ink-300 mb-1.5" htmlFor="email">E-mail</label>
              <input id="email" type="email" className="input-base" placeholder="seu@email.com.br"
                value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm text-ink-300 mb-1.5" htmlFor="senha">Senha</label>
              <div className="relative">
                <input id="senha" type={mostrar ? "text" : "password"} className="input-base pr-12"
                  placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)}
                  required autoComplete="current-password" />
                <button type="button" onClick={() => setMostrar((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors">
                  {mostrar ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {erro && <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">{erro}</div>}
            <button type="submit" className="btn-primary w-full justify-center flex items-center gap-2 mt-2" disabled={loading}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <div className="divider" />
          <p className="text-center text-sm text-ink-400">
            Não tem conta?{" "}
            <Link href="/cadastro" className="text-gold-400 hover:text-gold-300 transition-colors">Criar conta grátis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function traduzirErro(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("Email not confirmed"))       return "Confirme seu e-mail antes de entrar.";
  if (msg.includes("Too many requests"))         return "Muitas tentativas. Aguarde alguns minutos.";
  return "Erro ao entrar. Tente novamente.";
}