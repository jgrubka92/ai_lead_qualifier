import { createClient } from "@supabase/supabase-js";

// Service-role Supabase client — bypasses RLS. Used ONLY by the Stripe webhook
// to write subscription rows. Must never be imported from a Client Component,
// and SUPABASE_SERVICE_ROLE_KEY must never be exposed via a NEXT_PUBLIC_* var.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
