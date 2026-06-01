import { NextRequest, NextResponse } from "next/server";
import { configure, runs, tasks } from "@trigger.dev/sdk/v3";
import { createClient } from "@/lib/supabase/server";
import { isUserActive } from "@/lib/subscription";

configure({ secretKey: process.env.TRIGGER_API_KEY });

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // Verify auth — never trust user_id from the request body
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Paywall enforced server-side too — don't trust the UI gate before paid work runs
  if (!(await isUserActive(supabase, user.id))) {
    return NextResponse.json(
      { ok: false, error: "Active subscription required" },
      { status: 402 }
    );
  }

  const body = await req.json();

  // Trigger the task by string ID — no cross-package type import needed
  const handle = await tasks.trigger("qualify-lead", body);

  // Poll until complete or timeout
  const result = await runs.poll(handle.id, { pollIntervalMs: 1500 });

  if (result.status !== "COMPLETED") {
    return NextResponse.json(
      { ok: false, error: `Run ended with status: ${result.status}` },
      { status: 500 }
    );
  }

  const output = result.output as {
    score: number;
    tier: string;
    dimensions: Record<string, { score: number; reasoning: string }>;
    summary: string;
    nextAction: string;
  };

  // Persist to Supabase — log failure but don't block the response
  const { error: insertError } = await supabase.from("leads").insert({
    user_id: user.id,
    full_name: body.fullName,
    company: body.company,
    title: body.title,
    linkedin_url: body.linkedinUrl ?? null,
    company_size: body.companySize ?? null,
    industry: body.industry ?? null,
    source: body.source ?? null,
    notes: body.notes ?? null,
    score: output.score,
    tier: output.tier,
    dimensions: output.dimensions,
    summary: output.summary,
    next_action: output.nextAction,
  });

  if (insertError) {
    console.error("[qualify] Failed to save lead:", insertError.message);
  }

  return NextResponse.json({ ok: true, result: output });
}
