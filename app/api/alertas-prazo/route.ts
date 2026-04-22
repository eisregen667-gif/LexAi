import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  // Proteção — só roda com token secreto
  const token = request.nextUrl.searchParams.get("token");
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const supabase = createClient();

  // Buscar todos os processos concluídos
  const { data: processos } = await supabase
    .from("processos")
    .select("id, user_id, analise")
    .eq("status", "concluido");

  if (!processos?.length) return NextResponse.json({ enviados: 0 });

  // Buscar emails dos usuários
  const userIds = [...new Set(processos.map(p => p.user_id))];
  const { data: users } = await supabase.auth.admin.listUsers();
  const emailMap = new Map(
    (users?.users ?? []).map(u => [u.id, { email: u.email, nome: u.user_metadata?.nome_completo ?? "Advogado" }])
  );

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let enviados = 0;

  for (const processo of processos) {
    const prazos = processo.analise?.prazos ?? [];
    const usuario = emailMap.get(processo.user_id);
    if (!usuario?.email) continue;

    const prazosUrgentes = prazos.filter((p: any) => {
      if (!p.data_limite || p.cumprido) return false;
      const data = new Date(p.data_limite);
      data.setHours(0, 0, 0, 0);
      const diff = Math.round((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      return diff === 7 || diff === 3 || diff === 1 || diff === 0;
    });

    if (!prazosUrgentes.length) continue;

    for (const prazo of prazosUrgentes) {
      const data = new Date(prazo.data_limite);
      data.setHours(0, 0, 0, 0);
      const diff = Math.round((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

      const urgencia = diff === 0 ? "HOJE" : diff === 1 ? "amanhã" : `em ${diff} dias`;
      const emoji = diff === 0 ? "🔴" : diff === 1 ? "🟠" : "🟡";
      const numero = processo.analise?.numero_processo ?? "Processo sem número";
      const nomeUsuario = usuario.nome.split(" ")[0];

      await resend.emails.send({
        from: "LexIA <onboarding@resend.dev>",
        to: usuario.email,
        subject: `${emoji} Prazo vencendo ${urgencia} — ${numero}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#080A0F;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#0D1117;border:1px solid #29334A;border-radius:12px;overflow:hidden;">

    <!-- Header -->
    <div style="background:#0D1117;border-bottom:1px solid #29334A;padding:24px 32px;display:flex;align-items:center;gap:12px;">
      <div style="background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.3);border-radius:8px;width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;font-size:18px;">⚖️</div>
      <span style="color:#E2E7F0;font-size:20px;font-weight:600;">Lex<span style="color:#C9A84C;">IA</span></span>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:#8A97B0;font-size:14px;margin:0 0 8px;">Olá, Dr(a). ${nomeUsuario}</p>
      <h1 style="color:#E2E7F0;font-size:22px;font-weight:600;margin:0 0 24px;line-height:1.3;">
        ${emoji} Prazo vencendo <span style="color:#C9A84C;">${urgencia}</span>
      </h1>

      <!-- Prazo card -->
      <div style="background:#161B27;border:1px solid ${diff === 0 ? "#E05252" : diff === 1 ? "#E09B52" : "#C9A84C"};border-radius:10px;padding:20px;margin-bottom:24px;">
        <p style="color:#B8C2D4;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">Prazo</p>
        <p style="color:#E2E7F0;font-size:15px;font-weight:500;margin:0 0 16px;">${prazo.descricao}</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <p style="color:#8A97B0;font-size:11px;margin:0 0 2px;">Data limite</p>
            <p style="color:#E2E7F0;font-size:13px;font-weight:500;margin:0;">${new Date(prazo.data_limite).toLocaleDateString("pt-BR")}</p>
          </div>
          <div>
            <p style="color:#8A97B0;font-size:11px;margin:0 0 2px;">Criticidade</p>
            <p style="color:${prazo.criticidade === "alta" ? "#E05252" : "#E09B52"};font-size:13px;font-weight:500;margin:0;text-transform:capitalize;">${prazo.criticidade ?? "alta"}</p>
          </div>
          ${prazo.responsavel ? `
          <div style="grid-column:span 2;">
            <p style="color:#8A97B0;font-size:11px;margin:0 0 2px;">Responsável</p>
            <p style="color:#E2E7F0;font-size:13px;margin:0;">${prazo.responsavel}</p>
          </div>` : ""}
        </div>
      </div>

      <!-- Processo info -->
      <div style="background:#080A0F;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="color:#5B6882;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 4px;">Processo</p>
        <p style="color:#B8C2D4;font-size:14px;font-weight:500;margin:0 0 2px;">${numero}</p>
        <p style="color:#5B6882;font-size:12px;margin:0;">${processo.analise?.tipo_acao ?? ""}${processo.analise?.vara ? ` · ${processo.analise.vara}` : ""}</p>
      </div>

      <!-- CTA -->
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/processo/${processo.id}"
        style="display:block;background:#C9A84C;color:#080A0F;text-decoration:none;text-align:center;padding:14px 24px;border-radius:8px;font-weight:600;font-size:15px;">
        Ver processo no LexIA →
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #161B27;text-align:center;">
      <p style="color:#3A4560;font-size:12px;margin:0;">
        LexIA · Análise inteligente de processos jurídicos<br>
        Para não receber mais estes alertas, acesse as configurações da sua conta.
      </p>
    </div>
  </div>
</body>
</html>`,
      });

      enviados++;
    }
  }

  return NextResponse.json({ enviados, timestamp: new Date().toISOString() });
}
