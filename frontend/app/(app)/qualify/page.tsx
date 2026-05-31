"use client";

import { useState } from "react";

interface DimensionResult {
  score: number;
  reasoning: string;
}

interface QualificationResult {
  score: number;
  tier: "Hot" | "Warm" | "Cold";
  dimensions: {
    icpFit: DimensionResult;
    authority: DimensionResult;
    companySize: DimensionResult;
    source: DimensionResult;
  };
  summary: string;
  nextAction: string;
}

const DIMENSION_LABELS: Record<string, string> = {
  icpFit: "ICP Fit",
  authority: "Authority",
  companySize: "Company Size",
  source: "Source Quality",
};

const DIMENSION_WEIGHTS: Record<string, string> = {
  icpFit: "35%",
  authority: "30%",
  companySize: "20%",
  source: "15%",
};

export default function QualifyPage() {
  const [form, setForm] = useState({
    fullName: "",
    company: "",
    title: "",
    linkedinUrl: "",
    companySize: "51-200",
    industry: "",
    source: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QualificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setResult(data.result);
      } else {
        setError(data.error ?? "Unknown error");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "calc(100vh - 52px)", backgroundColor: "#FAF7F2", padding: "48px 16px 80px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
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
              fontSize: 32,
              fontWeight: 700,
              color: "#1A1714",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Qualify a Lead
          </h1>
          <p
            style={{
              marginTop: 8,
              fontSize: 14,
              color: "#9C9490",
              fontWeight: 400,
            }}
          >
            Powered by Faliam ICP · Gemini 2.5 Flash · Trigger.dev
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
              padding: "28px 28px 24px",
              marginBottom: 12,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#D97559",
                marginBottom: 20,
              }}
            >
              Lead Info
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required />
              <Field label="Company" name="company" value={form.company} onChange={handleChange} required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <Field label="Title" name="title" value={form.title} onChange={handleChange} required />
              <Field label="LinkedIn URL" name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <Label text="Company Size" />
                <select
                  name="companySize"
                  value={form.companySize}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  {["1-10", "11-50", "51-200", "201-500", "500+"].map((s) => (
                    <option key={s} value={s}>{s} employees</option>
                  ))}
                </select>
              </div>
              <Field label="Industry" name="industry" value={form.industry} onChange={handleChange} placeholder="e.g. Dental DSO" required />
            </div>

            <div style={{ marginBottom: 14 }}>
              <Field label="Source" name="source" value={form.source} onChange={handleChange} placeholder="e.g. LinkedIn, referral, inbound" required />
            </div>

            <div>
              <Label text="Notes" optional />
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Any extra context about this lead..."
                style={{ ...inputStyle, resize: "vertical", minHeight: 88 }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: loading ? "#E8A48E" : "#D97559",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: 15,
              padding: "13px 24px",
              borderRadius: 10,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background-color 0.15s",
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#C4623E";
            }}
            onMouseLeave={(e) => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#D97559";
            }}
          >
            {loading && (
              <svg
                className="spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            )}
            {loading ? "Analyzing…" : "Analyze Lead →"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div
            className="fade-in"
            style={{
              marginTop: 20,
              backgroundColor: "rgba(200, 60, 40, 0.06)",
              border: "1px solid rgba(200, 60, 40, 0.15)",
              borderRadius: 12,
              padding: "14px 18px",
              color: "#9B2C2C",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* Results */}
        {result && <Results result={result} />}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #E8E3DA",
  borderRadius: 8,
  padding: "9px 12px",
  fontSize: 14,
  color: "#1A1714",
  backgroundColor: "#FDFCFA",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function Label({ text, optional }: { text: string; optional?: boolean }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 13,
        fontWeight: 500,
        color: "#4A4540",
        marginBottom: 5,
      }}
    >
      {text}
      {optional && (
        <span style={{ color: "#B0AAA4", fontWeight: 400, marginLeft: 4 }}>
          (optional)
        </span>
      )}
    </label>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <Label text={label} />
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          borderColor: focused ? "#D97559" : "#E8E3DA",
          boxShadow: focused ? "0 0 0 3px rgba(217, 117, 89, 0.12)" : "none",
        }}
      />
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div
      style={{
        height: 5,
        borderRadius: 99,
        backgroundColor: "#F0EBE3",
        overflow: "hidden",
        marginTop: 5,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${score}%`,
          borderRadius: 99,
          background: "linear-gradient(90deg, #D97559, #E8926E)",
          transition: "width 0.6s ease-out",
        }}
      />
    </div>
  );
}

function TierBadge({ tier }: { tier: "Hot" | "Warm" | "Cold" }) {
  const styles = {
    Hot: { bg: "rgba(217, 117, 89, 0.12)", text: "#B84F30", border: "rgba(217, 117, 89, 0.3)" },
    Warm: { bg: "rgba(217, 170, 40, 0.1)", text: "#92660A", border: "rgba(217, 170, 40, 0.3)" },
    Cold: { bg: "rgba(90, 110, 140, 0.1)", text: "#3A5070", border: "rgba(90, 110, 140, 0.25)" },
  };
  const s = styles[tier];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 14px",
        borderRadius: 99,
        fontSize: 13,
        fontWeight: 600,
        backgroundColor: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        letterSpacing: "0.01em",
      }}
    >
      {tier}
    </span>
  );
}

function Results({ result }: { result: QualificationResult }) {
  return (
    <div
      className="fade-in"
      style={{
        marginTop: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}
    >
      {/* Score hero */}
      <div
        style={{
          padding: "28px 28px 24px",
          borderBottom: "1px solid #F0EBE3",
          display: "flex",
          alignItems: "flex-start",
          gap: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#D97559",
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            {result.score}
          </div>
          <div style={{ fontSize: 13, color: "#B0AAA4", marginTop: 3 }}>out of 100</div>
        </div>
        <div style={{ paddingTop: 6 }}>
          <TierBadge tier={result.tier} />
          <p
            style={{
              marginTop: 12,
              fontSize: 14,
              color: "#4A4540",
              lineHeight: 1.6,
              maxWidth: 440,
            }}
          >
            {result.summary}
          </p>
        </div>
      </div>

      {/* Score breakdown */}
      <div style={{ padding: "24px 28px", borderBottom: "1px solid #F0EBE3" }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#D97559",
            marginBottom: 20,
          }}
        >
          Score Breakdown
        </p>
        <div style={{ display: "grid", gap: 20 }}>
          {Object.entries(result.dimensions).map(([key, dim]) => (
            <div key={key}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 2,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#1A1714" }}>
                    {DIMENSION_LABELS[key] ?? key}
                  </span>
                  <span style={{ fontSize: 11, color: "#B0AAA4" }}>
                    {DIMENSION_WEIGHTS[key]} weight
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: dim.score >= 80 ? "#D97559" : dim.score >= 50 ? "#92660A" : "#3A5070",
                  }}
                >
                  {dim.score}
                </span>
              </div>
              <ScoreBar score={dim.score} />
              <p style={{ fontSize: 13, color: "#9C9490", lineHeight: 1.5 }}>
                {dim.reasoning}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Next action */}
      <div style={{ padding: "20px 28px" }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#D97559",
            marginBottom: 12,
          }}
        >
          Recommended Action
        </p>
        <div
          style={{
            borderLeft: "3px solid #D97559",
            paddingLeft: 14,
            paddingTop: 2,
            paddingBottom: 2,
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 600, color: "#1A1714", margin: 0 }}>
            {result.nextAction}
          </p>
        </div>
      </div>
    </div>
  );
}
