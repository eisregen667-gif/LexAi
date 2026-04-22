import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { processo_id } = await request.json();

  const { data: processo } = await supabase
    .from("processos").select("analise").eq("id", processo_id).eq("user_id", user.id).single();

  if (!processo) return NextResponse.json({ erro: "Processo não encontrado." }, { status: 404 });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `Com base neste processo jurídico, escreva um texto simples e claro para o CLIENTE (não advogado) entender o que está acontecendo. Use linguagem do dia a dia, sem termos jurídicos. Máximo 3 parágrafos curtos. Seja empático e direto.

Dados do processo:
${JSON.stringify(processo.analise, null, 2)}`
    }]
  });

  const texto = response.content.filter(b => b.type === "text").map(b => (b as any).text).join("");
  return NextResponse.json({ texto });
}

export const maxDuration = 60;
