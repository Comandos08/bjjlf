import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const schema = z.object({
  kind: z.enum(["event_registration", "academy_permit", "diploma"]),
  recordId: z.string().min(1).max(80).optional(),
  amountCents: z.number().int().positive().max(10_000_00),
  currency: z.enum(["BRL", "EUR", "USD"]),
  description: z.string().min(1).max(300),
  customerEmail: z.string().email().max(255).optional(),
  origin: z.string().url().max(300),
  successPath: z.string().min(1).max(200),
  cancelPath: z.string().min(1).max(200),
  metadata: z.record(z.string().max(60), z.string().max(500)).optional(),
});

export const createStripeCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return { ok: false as const, error: "STRIPE_SECRET_KEY not configured" };
    }
    const stripe = new Stripe(key);

    const successUrl = `${data.origin}${data.successPath}${data.successPath.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${data.origin}${data.cancelPath}`;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: data.customerEmail,
        line_items: [
          {
            price_data: {
              currency: data.currency.toLowerCase(),
              product_data: { name: data.description },
              unit_amount: data.amountCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          kind: data.kind,
          record_id: data.recordId ?? "",
          ...(data.metadata ?? {}),
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      // Pre-link the session id on internal record (best-effort)
      if (data.recordId) {
        try {
          if (data.kind === "event_registration") {
            await supabaseAdmin
              .from("event_registrations")
              .update({ stripe_session_id: session.id })
              .eq("id", data.recordId);
          } else if (data.kind === "academy_permit") {
            await supabaseAdmin
              .from("academy_permits")
              .update({ stripe_session_id: session.id })
              .eq("id", data.recordId);
          }
        } catch (e) {
          console.error("pre-link stripe_session_id failed", e);
        }
      }

      return { ok: true as const, url: session.url ?? "" };
    } catch (err) {
      console.error("createStripeCheckout error", err);
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Stripe error",
      };
    }
  });
