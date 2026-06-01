import { createClient } from "@/lib/supabase/server";
import { isActive } from "@/lib/subscription";
import { FREE_TIER_LIMIT } from "@/lib/constants";
import BillingActions from "./BillingActions";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Reuse the same supabase client + user to avoid duplicate auth.getUser() calls
  const [subData, countResult] = await Promise.all([
    user ? supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
    user ? supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", user.id) : Promise.resolve({ count: 0 }),
  ]);

  const sub = subData.data;
  const active = isActive(sub);
  const runsUsed = countResult.count ?? 0;

  const renews =
    sub?.current_period_end != null
      ? new Date(sub.current_period_end).toLocaleDateString(undefined, {
          year: "numeric", month: "short", day: "numeric",
        })
      : null;

  return (
    <div style={{ maxWidth: 460, margin: "48px auto", padding: "0 24px" }}>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1A1714", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
          {active ? "Your subscription" : "Plans"}
        </h1>
        <p style={{ fontSize: 14, color: "#9C9490", margin: 0 }}>
          {active ? "Manage your plan and payment details." : "Upgrade for unlimited lead qualifications."}
        </p>
      </div>

      {/* Free tier status (non-subscribers only) */}
      {!active && (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
            padding: "20px 28px",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1714" }}>Free plan</span>
            <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, color: "#276749", backgroundColor: "rgba(50, 150, 80, 0.1)", border: "1px solid rgba(50, 150, 80, 0.25)" }}>
              Active
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 99, backgroundColor: "#F0EBE3", overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${Math.min((runsUsed / FREE_TIER_LIMIT) * 100, 100)}%`, borderRadius: 99, background: "linear-gradient(90deg, #D97559, #E8926E)" }} />
          </div>
          <p style={{ fontSize: 13, color: "#6B6460", margin: 0 }}>
            {runsUsed} of {FREE_TIER_LIMIT} free qualifications used
          </p>
        </div>
      )}

      {/* Subscription card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
          padding: "28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1714" }}>AI Lead Qualifier Pro</span>
            <p style={{ fontSize: 13, color: "#9C9490", margin: "2px 0 0" }}>Unlimited qualifications · $49/mo</p>
          </div>
          {active && (
            <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, color: "#276749", backgroundColor: "rgba(50, 150, 80, 0.1)", border: "1px solid rgba(50, 150, 80, 0.25)", textTransform: "capitalize" }}>
              {sub?.status}
            </span>
          )}
        </div>

        {active && renews && (
          <p style={{ fontSize: 13, color: "#6B6460", margin: "0 0 18px" }}>Renews on {renews}</p>
        )}

        <BillingActions active={active} />
      </div>
    </div>
  );
}
