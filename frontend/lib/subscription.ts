import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type Subscription = {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  price_id: string | null;
  status: string;
  current_period_end: string | null;
};

// A user is "paid" when actively subscribed or in a trial.
export function isActive(sub: { status?: string | null } | null): boolean {
  return !!sub && (sub.status === "active" || sub.status === "trialing");
}

// Full subscription row for the current user (used by the billing page).
export async function getSubscription(): Promise<Subscription | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (data as Subscription) ?? null;
}

// Lightweight check reusing an already-authenticated client + user id.
// Avoids a second auth.getUser() round-trip in layouts/API routes.
export async function isUserActive(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();
  return isActive(data);
}
