"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const router = useRouter();
  const supabase = createClient();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 8) { setErro("Senha deve ter pelo menos 8 caracteres."); return; }
    setLoading(true);
    setErro(null);
    const { error } = await supabase.auth.signUp({
      email, password: senha,
      options: { data: { nome_completo: nome } },
    });
    if (error) { setErro("Erro ao criar conta: " + error.message); setLoading(false); return; }
    router.push("/processos");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Scale size={18} className="text-gold-400" />
            <span className="font-display text-2xl font-semibold text-ink-50">Lex<span className="text-gold-400">IA</span></span>
          </Link>
          <h1 className="font-display text-3xl text-ink-50">Criar conta</h1>
        </div>
        <div className="card">
          <form onSubmit={handleCadastro} className="space-y-4">
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Nome completo</label>
              <input type="text" className="input-base" placeholder="Dr. João Silva" value={nome} onChange={e => setNome(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">E-mail</label>
              <input type="email" className="input-base" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-ink-300 mb-1.5">Senha</label>
              <input type="password" className="input-base" placeholder="Mínimo 8 caracteres" value={senha} onChange={e => setSenha(e.target.value)} required />
            </div>
            {erro && <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">{erro}</div>}
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Criando..." : "Criar conta"}
            </button>
          </form>
          <div className="divider" />
          <p className="text-center text-sm text-ink-400">
            Já tem conta? <Link href="/login" className="text-gold-400">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
