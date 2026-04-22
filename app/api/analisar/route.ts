// app/api/analisar/route.ts
// Recebe o PDF em base64, envia para Claude, salva análise no Supabase

import { NextRequest, NextResponse } from "next/server";
import { createClient }              from "@/lib/supabase/server";
import { analisarProcesso }          from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  try {
    // ── Autenticação ─────────────────────────────────────────────────────────
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { sucesso: false, erro: "Não autenticado." },
        { status: 401 }
      );
    }

    // ── Parse do body ─────────────────────────────────────────────────────────
    const body = await request.json();
    const { processo_id, pdf_base64 } = body as {
      processo_id: string;
      pdf_base64:  string;
    };

    if (!processo_id || !pdf_base64) {
      return NextResponse.json(
        { sucesso: false, erro: "processo_id e pdf_base64 são obrigatórios." },
        { status: 400 }
      );
    }

    // ── Verificar que o processo pertence ao usuário ──────────────────────────
    const { data: processo, error: procError } = await supabase
      .from("processos")
      .select("id, user_id, status")
      .eq("id", processo_id)
      .eq("user_id", user.id)
      .single();

    if (procError || !processo) {
      return NextResponse.json(
        { sucesso: false, erro: "Processo não encontrado ou sem permissão." },
        { status: 404 }
      );
    }

    // ── Verificar limite de análises do plano ─────────────────────────────────
    const plano = user.user_metadata?.plano ?? "basico";

    if (plano === "basico") {
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("processos")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "concluido")
        .gte("created_at", inicioMes.toISOString());

      if ((count ?? 0) >= 30) {
        await supabase
          .from("processos")
          .update({ status: "erro", erro_mensagem: "Limite mensal atingido." })
          .eq("id", processo_id);

        return NextResponse.json(
          { sucesso: false, erro: "Limite de 30 análises mensais atingido. Faça upgrade para o plano Pro." },
          { status: 403 }
        );
      }
    }

    // ── Chamar Claude API ─────────────────────────────────────────────────────
    let analise;
    try {
      analise = await analisarProcesso(pdf_base64);
    } catch (iaError) {
      // Salvar erro no banco
      await supabase
        .from("processos")
        .update({
          status:          "erro",
          erro_mensagem:   iaError instanceof Error ? iaError.message : "Erro na análise da IA.",
          updated_at:      new Date().toISOString(),
        })
        .eq("id", processo_id);

      return NextResponse.json(
        { sucesso: false, erro: "Falha ao analisar o processo com IA. Tente novamente." },
        { status: 500 }
      );
    }

    // ── Salvar análise no Supabase ────────────────────────────────────────────
    const { error: updateError } = await supabase
      .from("processos")
      .update({
        analise:     analise,
        status:      "concluido",
        updated_at:  new Date().toISOString(),
      })
      .eq("id", processo_id);

    if (updateError) {
      console.error("Erro ao salvar análise:", updateError);
      return NextResponse.json(
        { sucesso: false, erro: "Análise concluída mas falhou ao salvar. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, processo_id, analise });

  } catch (error) {
    console.error("Erro inesperado em /api/analisar:", error);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

// Configurar timeout máximo (PDFs grandes podem demorar)
export const maxDuration = 120; // segundos — necessário no Vercel Pro
