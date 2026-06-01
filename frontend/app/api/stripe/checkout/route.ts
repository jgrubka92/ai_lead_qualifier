import { NextResponse } from "next/server";
import { stripe, PRICE_ID } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST() {
  // Verify auth — never trust the caller's identity from the request
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Reuse an existing Stripe customer if this user already has one,
  // otherwise let Checkout create one from their email.
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    client_reference_id: user.id,
    ...(existing?.stripe_customer_id
      ? { customer: existing.stripe_customer_id }
      : { customer_email: user.email ?? undefined }),
    // metadata travels onto the Subscription so the webhook can map it back
    subscription_data: { metadata: { supabase_user_id: user.id } },
    success_url: `${appUrl}/qualify?checkout=success`,
    cancel_url: `${appUrl}/billing?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
