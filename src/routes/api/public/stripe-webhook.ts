import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.STRIPE_SECRET_KEY;
        const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!key || !whSecret) {
          return new Response("Stripe not configured", { status: 503 });
        }
        const stripe = new Stripe(key);
        const sig = request.headers.get("stripe-signature");
        const body = await request.text();
        if (!sig) return new Response("Missing signature", { status: 400 });

        let event: Stripe.Event;
        try {
          event = await stripe.webhooks.constructEventAsync(body, sig, whSecret);
        } catch (err) {
          console.error("Webhook signature verification failed", err);
          return new Response("Invalid signature", { status: 400 });
        }

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          const kind = session.metadata?.kind;
          const recordId = session.metadata?.record_id;
          const paymentIntent =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null;

          try {
            if (kind === "event_registration" && recordId) {
              await supabaseAdmin
                .from("event_registrations")
                .update({
                  status: "confirmed",
                  paid_at: new Date().toISOString(),
                  stripe_session_id: session.id,
                  stripe_payment_intent: paymentIntent,
                })
                .eq("id", recordId);
            } else if (kind === "academy_permit" && recordId) {
              await supabaseAdmin
                .from("academy_permits")
                .update({
                  status: "active",
                  paid_at: new Date().toISOString(),
                  stripe_session_id: session.id,
                  stripe_payment_intent: paymentIntent,
                })
                .eq("id", recordId);
            }
            // diploma: lead is already persisted before checkout; no DB update needed.
          } catch (err) {
            console.error("Webhook handling DB error", err);
            return new Response("DB error", { status: 500 });
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
