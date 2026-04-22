"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Plano } from "@/lib/planos";
import { PLANOS } from "@/lib/planos";

export interface Assinatura {
  plano: Plano;
  status: string;
  analises_mes_atual: number;
  expira_em: string | null;
  limite_analises: number;
}

export function useAssinatura() {
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("assinaturas")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setAssinatura({
          plano: data.plano,
          status: data.status,
          analises_mes_atual: data.analises_mes_atual ?? 0,
          expira_em: data.expira_em,
          limite_analises: PLANOS[data.plano as Plano].analises_mes,
        });
      }
      setLoading(false);
    }
    carregar();
  }, []);

  return { assinatura, loading };
}
