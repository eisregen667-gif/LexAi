import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-display text-5xl font-bold text-ink-50 mb-6">
        Lex<span className="text-gold-400">IA</span>
      </h1>
      <p className="text-ink-300 text-xl max-w-xl mb-10">
        Análise inteligente de processos jurídicos com IA.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="btn-secondary px-8 py-3">Entrar</Link>
        <Link href="/cadastro" className="btn-primary px-8 py-3">Criar conta</Link>
      </div>
    </div>
  );
}
