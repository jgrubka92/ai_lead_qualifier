import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface Lead {
  id: string;
  full_name: string;
  company: string;
  title: string;
  score: number;
  tier: "Hot" | "Warm" | "Cold";
  summary: string;
  next_action: string;
  created_at: string;
  dimensions: Record<string, { score: number; reasoning: string }>;
}

const TIER_STYLES = {
  Hot: { bg: "rgba(217, 117, 89, 0.12)", text: "#B84F30", border: "rgba(217, 117, 89, 0.3)" },
  Warm: { bg: "rgba(217, 170, 40, 0.1)", text: "#92660A", border: "rgba(217, 170, 40, 0.3)" },
  Cold: { bg: "rgba(90, 110, 140, 0.1)", text: "#3A5070", border: "rgba(90, 110, 140, 0.25)" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div style={{ padding: "48px 16px 80px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#1A1714",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Lead History
          </h1>
          <p style={{ marginTop: 6, fontSize: 14, color: "#9C9490" }}>
            {leads && leads.length > 0
              ? `${leads.length} lead${leads.length === 1 ? "" : "s"} qualified`
              : "No leads qualified yet"}
          </p>
        </div>

        {/* Empty state */}
        {(!leads || leads.length === 0) && (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.07)",
              padding: "48px 28px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 15, color: "#6B6460", marginBottom: 20 }}>
              You haven&apos;t qualified any leads yet.
            </p>
            <Link
              href="/qualify"
              style={{
                display: "inline-block",
                backgroundColor: "#D97559",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: 14,
                padding: "10px 20px",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              Qualify your first lead →
            </Link>
          </div>
        )}

        {/* Lead list */}
        {leads && leads.length > 0 && (
          <div style={{ display: "grid", gap: 12 }}>
            {(leads as Lead[]).map((lead) => {
              const tier = (lead.tier ?? "Cold") as "Hot" | "Warm" | "Cold";
              const ts = TIER_STYLES[tier] ?? TIER_STYLES.Cold;
              return (
                <div
                  key={lead.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    border: "1px solid rgba(0,0,0,0.07)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    padding: "20px 24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1714" }}>
                          {lead.full_name}
                        </span>
                        <span style={{ fontSize: 13, color: "#9C9490" }}>{lead.title}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#6B6460", marginBottom: 10 }}>
                        {lead.company}
                      </div>
                      {lead.summary && (
                        <p style={{ fontSize: 13, color: "#9C9490", lineHeight: 1.5, margin: 0, maxWidth: 500 }}>
                          {lead.summary}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: "#D97559",
                            letterSpacing: "-0.03em",
                            lineHeight: 1,
                          }}
                        >
                          {lead.score}
                        </span>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 12px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 600,
                            backgroundColor: ts.bg,
                            color: ts.text,
                            border: `1px solid ${ts.border}`,
                          }}
                        >
                          {tier}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: "#B0AAA4" }}>
                        {formatDate(lead.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
