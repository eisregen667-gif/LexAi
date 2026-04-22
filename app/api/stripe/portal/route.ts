import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" });

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { data: assinatura } = await supabase
    .from("assinaturas").select("stripe_customer_id").eq("user_id", user.id).single();

  if (!assinatura?.stripe_customer_id) {
    return NextResponse.json({ erro: "Nenhuma assinatura ativa encontrada." }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer:   assinatura.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/perfil`,
  });

  return NextResponse.json({ url: session.url });
}
