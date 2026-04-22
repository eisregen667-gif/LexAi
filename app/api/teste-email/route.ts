import { NextRequest, NextResponse } from "next/server"; 
import { Resend } from "resend"; 
 
export async function GET(request: NextRequest) { 
  const resend = new Resend(process.env.RESEND_API_KEY || "placeholder"); 
  const token = request.nextUrl.searchParams.get("token"); 
  if (token !== process.env.CRON_SECRET) return NextResponse.json({ erro: "Nao autorizado." }, { status: 401 }); 
  const para = request.nextUrl.searchParams.get("email"); 
  if (!para) return NextResponse.json({ erro: "Informe ?email=" }, { status: 400 }); 
  const { data, error } = await resend.emails.send({ from: "LexIA ^<onboarding@resend.dev^>", to: para, subject: "Teste LexIA", html: "^<p^>Teste^</p^>" }); 
  if (error) return NextResponse.json({ erro: error }, { status: 500 }); 
  return NextResponse.json({ sucesso: true, id: data?.id }); 
}
