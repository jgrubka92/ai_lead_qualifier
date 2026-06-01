"use client";

import { useState } from "react";

export default function BillingActions({ active }: { active: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go(endpoint: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => go(active ? "/api/stripe/portal" : "/api/stripe/checkout")}
        disabled={loading}
        style={{
          width: "100%",
          backgroundColor: loading ? "#E8A48E" : "#D97559",
          color: "#FFFFFF",
          fontWeight: 600,
          fontSize: 15,
          padding: "11px 24px",
          borderRadius: 10,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          letterSpacing: "-0.01em",
        }}
      >
        {loading ? "…" : active ? "Manage billing" : "Subscribe"}
      </button>

      {error && (
        <div
          style={{
            marginTop: 14,
            backgroundColor: "rgba(200, 60, 40, 0.06)",
            border: "1px solid rgba(200, 60, 40, 0.15)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "#9B2C2C",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
