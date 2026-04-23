import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-950" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ borderBottom: "1px solid #161B27", padding: "0 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <span style={{ fontSize: 20, fontWeight: 600, color: "#E2E7F0" }}>Lex<span style={{ color: "#C9A84C" }}>IA</span></span>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/planos" style={{ color: "#8A97B0", fontSize: 13, textDecoration: "none" }}>Planos</Link>
            <Link href="/login" style={{ color: "#E2E7F0", padding: "7px 18px", borderRadius: 8, border: "1px solid #29334A", fontSize: 13, textDecoration: "none" }}>Entrar</Link>
            <Link href="/cadastro" style={{ background: "#C9A84C", color: "#080A0F", padding: "7px 18px", borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 32px 64px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", fontSize: 11, padding: "4px 12px", borderRadius: 20, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
          IA jurídica para advogados brasileiros
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.15, color: "#E2E7F0", marginBottom: 20 }}>
          Analise processos em<br /><span style={{ color: "#C9A84C" }}>segundos, não horas</span>
        </h1>
        <p style={{ fontSize: 18, color: "#8A97B0", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.6 }}>
          Faça upload do PDF do processo e obtenha resumo completo, prazos, linha do tempo e chat com IA — tudo em um só lugar.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/cadastro" style={{ background: "#C9A84C", color: "#080A0F", padding: "14px 32px", borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: "none" }}>Criar conta grátis →</Link>
          <Link href="/login" style={{ background: "transparent", color: "#E2E7F0", padding: "14px 32px", borderRadius: 8, fontSize: 15, textDecoration: "none", border: "1px solid #29334A" }}>Já tenho conta</Link>
        </div>
        <p style={{ fontSize: 12, color: "#8A97B0", marginTop: 16 }}>Sem cartão de crédito · 7 dias grátis</p>
      </section>

      <hr style={{ border: "none", borderTop: "1px solid #161B27" }} />

      {/* Features */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "64px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-block", background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", fontSize: 11, padding: "4px 12px", borderRadius: 20, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>Funcionalidades</div>
          <h2 style={{ fontSize: 30, fontWeight: 600, color: "#E2E7F0" }}>Tudo que seu escritório precisa</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { icon: "⚡", title: "Análise instantânea", desc: "Upload do PDF e em segundos você tem resumo, partes, pedidos e estratégia processual." },
            { icon: "⏰", title: "Alertas de prazo", desc: "Receba e-mails automáticos 7, 3 e 1 dia antes dos prazos vencerem. Nunca mais perca um prazo." },
            { icon: "💬", title: "Chat com o processo", desc: "Faça perguntas sobre o processo em linguagem natural e receba respostas precisas com IA." },
            { icon: "📄", title: "Minuta automática", desc: "Gere minutas de petições e documentos com base na análise do processo." },
            { icon: "📊", title: "Painel do escritório", desc: "Visão geral de todos os processos, prazos urgentes e estatísticas do seu escritório." },
            { icon: "🔗", title: "Resumo para cliente", desc: "Gere resumos simplificados para enviar aos clientes por WhatsApp ou e-mail." },
          ].map((f) => (
            <div key={f.title} style={{ background: "#0D1117", border: "1px solid #29334A", borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 22, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#E2E7F0", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#8A97B0", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr style={{ border: "none", borderTop: "1px solid #161B27" }} />

      {/* Pricing */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "64px 32px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", fontSize: 11, padding: "4px 12px", borderRadius: 20, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>Planos</div>
        <h2 style={{ fontSize: 30, fontWeight: 600, color: "#E2E7F0", marginBottom: 40 }}>Simples e transparente</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 680, margin: "0 auto" }}>
          <div style={{ background: "#0D1117", border: "1px solid #29334A", borderRadius: 12, padding: 24, textAlign: "left" }}>
            <p style={{ fontSize: 13, color: "#8A97B0", marginBottom: 4 }}>Básico</p>
            <p style={{ fontSize: 32, fontWeight: 700, color: "#E2E7F0" }}>R$97<span style={{ fontSize: 14, fontWeight: 400, color: "#8A97B0" }}>/mês</span></p>
            <hr style={{ border: "none", borderTop: "1px solid #161B27", margin: "16px 0" }} />
            <ul style={{ listStyle: "none", fontSize: 13, color: "#B8C2D4", lineHeight: 2.2 }}>
              <li>✓ 20 processos/mês</li>
              <li>✓ Análise completa com IA</li>
              <li>✓ Alertas de prazo</li>
              <li>✓ Chat com processo</li>
              <li style={{ color: "#5B6882" }}>✗ Minutas automáticas</li>
              <li style={{ color: "#5B6882" }}>✗ Comparar processos</li>
            </ul>
            <Link href="/cadastro" style={{ display: "block", textAlign: "center", marginTop: 20, padding: "12px 0", borderRadius: 8, border: "1px solid #29334A", color: "#E2E7F0", textDecoration: "none", fontSize: 14 }}>Começar</Link>
          </div>
          <div style={{ background: "#0D1117", border: "2px solid #C9A84C", borderRadius: 12, padding: 24, textAlign: "left", position: "relative" }}>
            <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#C9A84C", color: "#080A0F", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>MAIS POPULAR</div>
            <p style={{ fontSize: 13, color: "#8A97B0", marginBottom: 4 }}>Pro</p>
            <p style={{ fontSize: 32, fontWeight: 700, color: "#E2E7F0" }}>R$197<span style={{ fontSize: 14, fontWeight: 400, color: "#8A97B0" }}>/mês</span></p>
            <hr style={{ border: "none", borderTop: "1px solid #161B27", margin: "16px 0" }} />
            <ul style={{ listStyle: "none", fontSize: 13, color: "#B8C2D4", lineHeight: 2.2 }}>
              <li>✓ Processos ilimitados</li>
              <li>✓ Análise completa com IA</li>
              <li>✓ Alertas de prazo</li>
              <li>✓ Chat com processo</li>
              <li>✓ Minutas automáticas</li>
              <li>✓ Comparar processos</li>
            </ul>
            <Link href="/cadastro" style={{ display: "block", textAlign: "center", marginTop: 20, padding: "12px 0", borderRadius: 8, background: "#C9A84C", color: "#080A0F", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Começar →</Link>
          </div>
        </div>
      </section>

      <hr style={{ border: "none", borderTop: "1px solid #161B27" }} />

      {/* CTA */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "64px 32px", textAlign: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, color: "#E2E7F0", marginBottom: 12 }}>Pronto para economizar horas por semana?</h2>
        <p style={{ color: "#8A97B0", marginBottom: 28 }}>Junte-se a centenas de advogados que já usam LexIA</p>
        <Link href="/cadastro" style={{ background: "#C9A84C", color: "#080A0F", padding: "14px 36px", borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: "none" }}>Criar conta grátis →</Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #161B27", padding: "24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#3A4560" }}>© 2025 LexIA · Análise inteligente de processos jurídicos</p>
      </footer>

    </div>
  );
}