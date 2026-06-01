import { createClient } from "@/lib/supabase/server";
import { isUserActive } from "@/lib/subscription";
import QualifyForm from "./QualifyForm";

export default async function QualifyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // user is guaranteed non-null here — (app)/layout.tsx redirects to /login otherwise

  let subscribed = false;
  let runsUsed = 0;
  try {
    const [sub, count] = await Promise.all([
      isUserActive(supabase, user!.id),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
    ]);
    subscribed = sub;
    runsUsed = count.count ?? 0;
  } catch {
    // DB unavailable — fail open (show form, gate enforced server-side at API)
  }

  return <QualifyForm runsUsed={runsUsed} isSubscribed={subscribed} />;
}
