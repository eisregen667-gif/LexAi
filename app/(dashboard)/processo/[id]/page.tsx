// app/(dashboard)/processo/[id]/page.tsx
// Página de resultado: abas Resumo | Timeline | Prazos + Chat lateral

import { notFound, redirect } from "next/navigation";
import { createClient }       from "@/lib/supabase/server";
import type { ProcessoDB }    from "@/lib/types";
import ProcessoView           from "@/components/processo/ProcessoView";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  return { title: `Processo ${params.id.slice(0, 8)}…` };
}

export default async function ProcessoPage({ params }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Buscar processo com histórico de chat
  const { data: processo, error } = await supabase
    .from("processos")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !processo) notFound();

  if (processo.status !== "concluido") {
    redirect("/dashboard/processos");
  }

  const { data: mensagens } = await supabase
    .from("mensagens_chat")
    .select("*")
    .eq("processo_id", params.id)
    .order("created_at", { ascending: true });

  return (
    <ProcessoView
      processo={processo as ProcessoDB}
      mensagensIniciais={mensagens ?? []}
    />
  );
}
