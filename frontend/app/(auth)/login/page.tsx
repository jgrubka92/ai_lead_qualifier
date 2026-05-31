"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data.session) {
        router.push("/qualify");
        return;
      }
      setMessage("Check your email to confirm your account, then sign in.");
      setMode("signin");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/qualify");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #E8E3DA",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    color: "#1A1714",
    backgroundColor: "#FDFCFA",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      {/* Header */}
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#FFFFFF",
              backgroundColor: "#1A1714",
              padding: "3px 10px",
              borderRadius: 20,
              letterSpacing: "0.02em",
            }}
          >
            Faliam
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#D97559",
              backgroundColor: "rgba(217, 117, 89, 0.1)",
              padding: "3px 10px",
              borderRadius: 20,
              border: "1px solid rgba(217, 117, 89, 0.25)",
            }}
          >
            AI Lead Qualifier
          </span>
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#1A1714",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
      </div>

      {/* Card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
          padding: "28px 28px 24px",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "#4A4540",
                marginBottom: 5,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "#4A4540",
                marginBottom: 5,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: 16,
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

          {message && (
            <div
              style={{
                marginBottom: 16,
                backgroundColor: "rgba(50, 150, 80, 0.06)",
                border: "1px solid rgba(50, 150, 80, 0.2)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#276749",
                fontSize: 13,
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
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
            {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>

      {/* Toggle mode */}
      <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#9C9490" }}>
        {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setMessage(null); }}
          style={{
            background: "none",
            border: "none",
            color: "#D97559",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            padding: 0,
          }}
        >
          {mode === "signin" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
