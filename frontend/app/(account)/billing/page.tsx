import { getSubscription, isActive } from "@/lib/subscription";
import BillingActions from "./BillingActions";

export default async function BillingPage() {
  const sub = await getSubscription();
  const active = isActive(sub);

  const renews =
    sub?.current_period_end != null
      ? new Date(sub.current_period_end).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

  return (
    <div style={{ maxWidth: 460, margin: "48px auto", padding: "0 24px" }}>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#1A1714",
            letterSpacing: "-0.02em",
            margin: "0 0 6px",
          }}
        >
          {active ? "Your subscription" : "Subscribe to continue"}
        </h1>
        <p style={{ fontSize: 14, color: "#9C9490", margin: 0 }}>
          {active
            ? "Manage your plan and payment details."
            : "An active subscription is required to use the AI Lead Qualifier."}
        </p>
      </div>

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
          <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1714" }}>
            AI Lead Qualifier
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 20,
              color: active ? "#276749" : "#9B2C2C",
              backgroundColor: active ? "rgba(50, 150, 80, 0.1)" : "rgba(200, 60, 40, 0.08)",
              border: `1px solid ${active ? "rgba(50, 150, 80, 0.25)" : "rgba(200, 60, 40, 0.18)"}`,
              textTransform: "capitalize",
            }}
          >
            {sub?.status ?? "inactive"}
          </span>
        </div>

        {active && renews && (
          <p style={{ fontSize: 13, color: "#6B6460", margin: "0 0 18px" }}>
            Renews on {renews}
          </p>
        )}

        <BillingActions active={active} />
      </div>
    </div>
  );
}
