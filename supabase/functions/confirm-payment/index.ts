// STRIPE WEBHOOK — Configurar com o cliente
// Necessário: STRIPE_WEBHOOK_SECRET no Supabase Vault
//
// Quando configurado, esta função irá:
// 1. Verificar assinatura do webhook Stripe
// 2. Em checkout.session.completed:
//    - Atualizar status → 'confirmed'
//    - Gerar registration_number (via trigger no banco)
//    - Preencher paid_at, stripe_session_id
//    - Adicionar em competition_history se athlete_id

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (_req) => {
  // TODO: Implementar após configurar STRIPE_WEBHOOK_SECRET
  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
