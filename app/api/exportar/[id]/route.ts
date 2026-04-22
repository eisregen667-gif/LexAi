import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { data: processo } = await supabase
    .from("processos")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!processo) return NextResponse.json({ erro: "Processo não encontrado." }, { status: 404 });

  const a = processo.analise;
  const hoje = new Date().toLocaleDateString("pt-BR");

  const linhas: string[] = [];

  linhas.push("LEXIA — RESUMO DE PROCESSO JURÍDICO");
  linhas.push(`Gerado em: ${hoje}`);
  linhas.push("=".repeat(60));
  linhas.push("");

  if (a.numero_processo) linhas.push(`Número: ${a.numero_processo}`);
  if (a.tipo_acao)       linhas.push(`Tipo de ação: ${a.tipo_acao}`);
  if (a.vara)            linhas.push(`Vara: ${a.vara}`);
  if (a.comarca)         linhas.push(`Comarca: ${a.comarca}`);
  if (a.tribunal)        linhas.push(`Tribunal: ${a.tribunal}`);
  if (a.valor_causa)     linhas.push(`Valor da causa: ${a.valor_causa}`);
  if (a.data_distribuicao) linhas.push(`Distribuição: ${a.data_distribuicao}`);
  linhas.push("");

  if (a.resumo_executivo) {
    linhas.push("RESUMO EXECUTIVO");
    linhas.push("-".repeat(40));
    linhas.push(a.resumo_executivo);
    linhas.push("");
  }

  if (a.objeto) {
    linhas.push("OBJETO DA AÇÃO");
    linhas.push("-".repeat(40));
    linhas.push(a.objeto);
    linhas.push("");
  }

  if (a.partes?.length > 0) {
    linhas.push("PARTES ENVOLVIDAS");
    linhas.push("-".repeat(40));
    a.partes.forEach((p: any) => {
      linhas.push(`${p.tipo.toUpperCase()}: ${p.nome}${p.cpf_cnpj ? ` (${p.cpf_cnpj})` : ""}${p.advogado ? ` — Adv: ${p.advogado}` : ""}`);
    });
    linhas.push("");
  }

  if (a.pedidos?.length > 0) {
    linhas.push("PEDIDOS");
    linhas.push("-".repeat(40));
    a.pedidos.forEach((p: any, i: number) => {
      linhas.push(`${i + 1}. ${p.descricao}${p.tipo ? ` [${p.tipo}]` : ""}`);
    });
    linhas.push("");
  }

  if (a.decisoes?.length > 0) {
    linhas.push("DECISÕES");
    linhas.push("-".repeat(40));
    a.decisoes.forEach((d: any) => {
      linhas.push(`${d.data} — ${d.tipo}${d.resultado ? ` (${d.resultado})` : ""}`);
      linhas.push(`  ${d.descricao}`);
    });
    linhas.push("");
  }

  if (a.prazos?.length > 0) {
    linhas.push("PRAZOS");
    linhas.push("-".repeat(40));
    a.prazos.forEach((p: any) => {
      const status = p.cumprido ? "[CUMPRIDO]" : `[${(p.criticidade ?? "baixa").toUpperCase()}]`;
      linhas.push(`${p.data_limite} ${status} — ${p.descricao}${p.responsavel ? ` (${p.responsavel})` : ""}`);
    });
    linhas.push("");
  }

  if (a.timeline?.length > 0) {
    linhas.push("LINHA DO TEMPO");
    linhas.push("-".repeat(40));
    a.timeline.forEach((e: any) => {
      linhas.push(`${e.data} — ${e.tipo}: ${e.descricao}${e.autor ? ` (${e.autor})` : ""}`);
    });
    linhas.push("");
  }

  if (a.observacoes) {
    linhas.push("OBSERVAÇÕES");
    linhas.push("-".repeat(40));
    linhas.push(a.observacoes);
    linhas.push("");
  }

  linhas.push("=".repeat(60));
  linhas.push("Gerado por LexIA — lexia.com.br");

  const texto = linhas.join("\n");

  return new NextResponse(texto, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="resumo-${params.id.slice(0,8)}.txt"`,
    },
  });
}
