// app/api/chat/route.ts
// Chat em linguagem natural com o processo jurídico

import { NextRequest, NextResponse } from "next/server";
import { createClient }              from "@/lib/supabase/server";
import { chatComProcesso }           from "@/lib/anthropic";
import type { ChatRequest }          from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // ── Autenticação ─────────────────────────────────────────────────────────
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { resposta: "", erro: "Não autenticado." },
        { status: 401 }
      );
    }

    // ── Parse do body ─────────────────────────────────────────────────────────
    const body = await request.json() as ChatRequest;
    const { processo_id, mensagem, historico } = body;

    if (!processo_id || !mensagem?.trim()) {
      return NextResponse.json(
        { resposta: "", erro: "processo_id e mensagem são obrigatórios." },
        { status: 400 }
      );
    }

    // ── Buscar processo e verificar permissão ─────────────────────────────────
    const { data: processo, error: procError } = await supabase
      .from("processos")
      .select("id, user_id, status, analise")
      .eq("id", processo_id)
      .eq("user_id", user.id)
      .single();

    if (procError || !processo) {
      return NextResponse.json(
        { resposta: "", erro: "Processo não encontrado." },
        { status: 404 }
      );
    }

    if (processo.status !== "concluido" || !processo.analise) {
      return NextResponse.json(
        { resposta: "", erro: "Processo ainda não foi analisado." },
        { status: 400 }
      );
    }

    // ── Chamar Claude com contexto do processo ────────────────────────────────
    const resposta = await chatComProcesso(
      processo.analise,
      mensagem,
      historico ?? []
    );

    // ── Persistir mensagens no banco ──────────────────────────────────────────
    await supabase.from("mensagens_chat").insert([
      { processo_id, role: "user",      content: mensagem },
      { processo_id, role: "assistant", content: resposta },
    ]);

    return NextResponse.json({ resposta });

  } catch (error) {
    console.error("Erro em /api/chat:", error);
    return NextResponse.json(
      { resposta: "", erro: "Erro ao processar sua pergunta. Tente novamente." },
      { status: 500 }
    );
  }
}

export const maxDuration = 60;
