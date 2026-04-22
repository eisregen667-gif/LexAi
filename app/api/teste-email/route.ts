import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const para = request.nextUrl.searchParams.get("email");
  if (!para) return NextResponse.json({ erro: "Informe ?email=seu@email.com" }, { status: 400 });

  const { data, error } = await resend.emails.send({
    from: "LexIA <onboarding@resend.dev>",
    to: para,
    subject: "🟡 Prazo vencendo em 3 dias — Processo 1234567-89.2023",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#080A0F;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#0D1117;border:1px solid #29334A;border-radius:12px;overflow:hidden;">
    <div style="background:#0D1117;border-bottom:1px solid #29334A;padding:24px 32px;">
      <span style="color:#E2E7F0;font-size:20px;font-weight:600;">⚖️ Lex<span style="color:#C9A84C;">IA</span></span>
    </div>
    <div style="padding:32px;">
      <p style="color:#8A97B0;font-size:14px;margin:0 0 8px;">Olá, Dr(a). Guilherme</p>
      <h1 style="color:#E2E7F0;font-size:22px;font-weight:600;margin:0 0 24px;">
        🟡 Prazo vencendo <span style="color:#C9A84C;">em 3 dias</span>
      </h1>
      <div style="background:#161B27;border:1px solid #C9A84C;border-radius:10px;padding:20px;margin-bottom:24px;">
        <p style="color:#B8C2D4;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">Prazo</p>
        <p style="color:#E2E7F0;font-size:15px;font-weight:500;margin:0 0 16px;">Contestação do réu — prazo de 15 dias</p>
        <p style="color:#8A97B0;font-size:11px;margin:0 0 2px;">Data limite</p>
        <p style="color:#E2E7F0;font-size:13px;font-weight:500;margin:0;">24/04/2026</p>
      </div>
      <div style="background:#080A0F;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="color:#5B6882;font-size:11px;text-transform:uppercase;margin:0 0 4px;">Processo</p>
        <p style="color:#B8C2D4;font-size:14px;font-weight:500;margin:0 0 2px;">1234567-89.2023.8.26.0001</p>
        <p style="color:#5B6882;font-size:12px;margin:0;">Ação de Cobrança · 1ª Vara Cível</p>
      </div>
      <a href="http://localhost:3000"
        style="display:block;background:#C9A84C;color:#080A0F;text-decoration:none;text-align:center;padding:14px 24px;border-radius:8px;font-weight:600;font-size:15px;">
        Ver processo no LexIA →
      </a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #161B27;text-align:center;">
      <p style="color:#3A4560;font-size:12px;margin:0;">LexIA · Análise inteligente de processos jurídicos</p>
    </div>
  </div>
</body>
</html>`,
  });

  if (error) return NextResponse.json({ erro: error }, { status: 500 });
  return NextResponse.json({ sucesso: true, id: data?.id });
}
