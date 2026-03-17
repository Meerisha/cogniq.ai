import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Aggregate data across providers and generate parent-friendly
  // and clinician-friendly summaries using GPT-4o.
  return NextResponse.json({
    parentSummary:
      "Progress insight engine not wired up yet. This endpoint will return a plain-English weekly parent summary.",
    therapistSummary:
      "This endpoint will also return a clinical weekly summary with trends for therapists.",
  });
}

