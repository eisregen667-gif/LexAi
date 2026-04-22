import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { processo_id, tipo_minuta, instrucoes } = await request.json();

  const { data: processo } = await supabase
    .from("processos").select("analise").eq("id", processo_id).eq("user_id", user.id).single();

  if (!processo) return NextResponse.json({ erro: "Processo não encontrado." }, { status: 404 });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: `Você é um advogado brasileiro experiente. Com base nos dados do processo abaixo, redija uma minuta de ${tipo_minuta} completa e profissional.

DADOS DO PROCESSO:
${JSON.stringify(processo.analise, null, 2)}

${instrucoes ? `INSTRUÇÕES ADICIONAIS DO ADVOGADO:\n${instrucoes}\n` : ""}

DIRETRIZES:
- Use linguagem jurídica formal brasileira
- Inclua os fatos, fundamentos jurídicos e pedidos adequados
- Cite legislação e jurisprudência pertinentes quando relevante
- Use "Excelentíssimo Senhor Doutor Juiz" no vocativo quando aplicável
- Deixe [colchetes] para dados que precisam ser preenchidos (datas, valores, etc.)
- Inclua o local e data ao final como: "[Cidade], [data]."
- Finalize com espaço para assinatura do advogado

Redija a minuta completa agora:`
    }]
  });

  const minuta = response.content.filter(b => b.type === "text").map(b => (b as any).text).join("");
  return NextResponse.json({ minuta });
}

export const maxDuration = 120;
