export interface LeadInput {
  fullName: string;
  company: string;
  title: string;
  linkedinUrl: string;
  companySize: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
  industry: string;
  source: string;
  notes?: string;
}

export interface DimensionResult {
  score: number;
  reasoning: string;
}

export interface QualificationResult {
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

export function formatLeadForPrompt(lead: LeadInput): string {
  return JSON.stringify(
    {
      fullName: lead.fullName,
      company: lead.company,
      title: lead.title,
      linkedinUrl: lead.linkedinUrl,
      companySize: lead.companySize,
      industry: lead.industry,
      source: lead.source,
      notes: lead.notes ?? "",
    },
    null,
    2
  );
}

export function parseTier(score: number): "Hot" | "Warm" | "Cold" {
  if (score >= 80) return "Hot";
  if (score >= 50) return "Warm";
  return "Cold";
}

export function validateResult(raw: unknown): QualificationResult {
  const r = raw as QualificationResult;
  if (
    typeof r.score !== "number" ||
    !r.tier ||
    !r.dimensions ||
    !r.summary ||
    !r.nextAction
  ) {
    throw new Error("Invalid qualification result shape from AI");
  }
  r.tier = parseTier(r.score);
  return r;
}
