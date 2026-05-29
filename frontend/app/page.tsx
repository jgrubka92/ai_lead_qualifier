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

const TIER_STYLES: Record<string, string> = {
  Hot: "bg-red-100 text-red-800 border-red-300",
  Warm: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Cold: "bg-blue-100 text-blue-800 border-blue-300",
};

const DIMENSION_LABELS: Record<string, string> = {
  icpFit: "ICP Fit",
  authority: "Authority",
  companySize: "Company Size",
  source: "Source Quality",
};

export default function Home() {
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Lead Qualifier
        </h1>
        <p className="text-gray-500 mb-8 text-sm">
          Powered by Faliam ICP · Built on Trigger.dev + Claude
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required />
            <Field label="Company" name="company" value={form.company} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title" name="title" value={form.title} onChange={handleChange} required />
            <Field label="LinkedIn URL" name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Size
              </label>
              <select
                name="companySize"
                value={form.companySize}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {["1-10", "11-50", "51-200", "201-500", "500+"].map((s) => (
                  <option key={s} value={s}>{s} employees</option>
                ))}
              </select>
            </div>
            <Field label="Industry" name="industry" value={form.industry} onChange={handleChange} placeholder="e.g. Dental DSO" required />
          </div>
          <Field label="Source" name="source" value={form.source} onChange={handleChange} placeholder="e.g. LinkedIn, referral, inbound" required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any extra context about this lead..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
          >
            {loading ? "Analyzing…" : "Analyze Lead →"}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {result && <Results result={result} />}
      </div>
    </main>
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
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Results({ result }: { result: QualificationResult }) {
  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
      <div className="flex items-center gap-4">
        <div className="text-5xl font-bold text-gray-900">{result.score}</div>
        <div>
          <span
            className={`inline-block px-3 py-1 rounded-full border text-sm font-semibold ${TIER_STYLES[result.tier]}`}
          >
            {result.tier}
          </span>
          <p className="text-xs text-gray-400 mt-1">out of 100</p>
        </div>
      </div>

      <p className="text-gray-700 text-sm leading-relaxed">{result.summary}</p>

      <div className="border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
          Score Breakdown
        </p>
        <div className="space-y-3">
          {Object.entries(result.dimensions).map(([key, dim]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">
                  {DIMENSION_LABELS[key] ?? key}
                </span>
                <span className="text-gray-500">{dim.score}/100</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: `${dim.score}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{dim.reasoning}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Next Action
        </p>
        <p className="text-sm font-medium text-gray-900">{result.nextAction}</p>
      </div>
    </div>
  );
}
