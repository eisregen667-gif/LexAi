import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { pdf1, pdf2, nome1, nome2 } = await request.json();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{
      role: "user",
      content: [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf1 } },
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf2 } },
        { type: "text", text: `Compare os dois processos jurídicos acima (Documento 1: ${nome1} / Documento 2: ${nome2}).

Estruture sua análise em:
1. SEMELHANÇAS — partes, tipo de ação, pedidos em comum
2. DIFERENÇAS — o que muda entre os dois
3. CONTRADIÇÕES — pontos conflitantes ou inconsistentes
4. PONTOS CRÍTICOS — riscos, alertas e recomendações para o advogado

Seja direto e objetivo. Use linguagem profissional.` }
      ]
    }]
  });

  const analise = response.content.filter(b => b.type === "text").map(b => (b as any).text).join("");
  return NextResponse.json({ analise });
}

export const maxDuration = 120;
