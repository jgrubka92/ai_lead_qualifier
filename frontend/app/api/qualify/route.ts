import { NextRequest, NextResponse } from "next/server";
import { runs, tasks } from "@trigger.dev/sdk/v3";

// Tell Vercel this function can run up to 60s (requires Pro plan).
// Claude + Trigger.dev round-trip can take 15–30s — default 10s will timeout.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Trigger the task by string ID — no cross-package type import needed.
  // The task is deployed separately to Trigger.dev; the frontend just calls it by name.
  const handle = await tasks.trigger("qualify-lead", body);

  // Poll until complete or timeout
  const result = await runs.poll(handle.id, { pollIntervalMs: 1500 });

  if (result.status === "COMPLETED") {
    return NextResponse.json({ ok: true, result: result.output });
  }

  return NextResponse.json(
    { ok: false, error: `Run ended with status: ${result.status}` },
    { status: 500 }
  );
}
