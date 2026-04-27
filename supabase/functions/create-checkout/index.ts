// STRIPE INTEGRATION — Configurar com o cliente
// Necessário: STRIPE_SECRET_KEY no Supabase Vault
// Dashboard > Edge Functions > Secrets
//
// Quando configurado, esta função irá:
// 1. Receber registration_id, amount_cents, event_name
// 2. Criar Stripe Checkout Session
// 3. Retornar { url: checkout_url }
//
// Documentação: https://stripe.com/docs/checkout/quickstart

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // TODO: Implementar após configurar STRIPE_SECRET_KEY
  return new Response(
    JSON.stringify({
      error: "Pagamento ainda não configurado.",
      message: "Entre em contato com a federação.",
    }),
    {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
