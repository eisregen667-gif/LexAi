import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" });

  const PRICES = {
    basico_mensal: process.env.STRIPE_PRICE_BASICO_MENSAL!,
    basico_anual:  process.env.STRIPE_PRICE_BASICO_ANUAL!,
    pro_mensal:    process.env.STRIPE_PRICE_PRO_MENSAL!,
    pro_anual:     process.env.STRIPE_PRICE_PRO_ANUAL!,
  };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { plano, periodo } = await request.json();
  const priceKey = `${plano}_${periodo}` as keyof typeof PRICES;
  const priceId  = PRICES[priceKey];

  if (!priceId) return NextResponse.json({ erro: "Plano inválido." }, { status: 400 });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card", "boleto"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/planos?sucesso=true`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/planos`,
    client_reference_id: user.id,
    customer_email: user.email,
    locale: "pt-BR",
    metadata: { user_id: user.id, plano, periodo },
  });

  return NextResponse.json({ url: session.url });
}