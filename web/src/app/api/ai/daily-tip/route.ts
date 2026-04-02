import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return Math.max(0, age);
}

function fallbackTip(goals: string[], age: number | null) {
  const focus = goals[0] ?? "connection";
  const ageText = age != null ? `for a ${age}-year-old` : "today";
  return `Try a 5-minute “two-choice” game ${ageText}: offer two simple options (two toys or two snacks), pause, and wait for a point, look, or word. When they choose, celebrate the choice and name it out loud (“You picked the ball!”). Keep it light and stop while it still feels fun—this supports ${focus.toLowerCase()} in a gentle way.`;
}

async function openAiDailyTip(args: { age: number | null; goals: string[] }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { activity: fallbackTip(args.goals, args.age), usedAi: false };
  }

  const system =
    "You are a warm, helpful assistant for parents of children in ASD therapy. Suggest one simple, fun home activity (2-3 sentences max) based on the child's therapy goals. Use plain language, be encouraging and specific.";
  const user = `Child age: ${args.age ?? "unknown"}. Goals: ${args.goals.length ? args.goals.join(", ") : "none listed"}. Suggest one activity for today.`;

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
      max_tokens: 120,
    }),
  });

  if (!resp.ok) {
    return { activity: fallbackTip(args.goals, args.age), usedAi: false };
  }

  const json = (await resp.json().catch(() => null)) as any;
  const text = String(json?.choices?.[0]?.message?.content ?? "").trim();
  return { activity: text || fallbackTip(args.goals, args.age), usedAi: true };
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // No-op: this endpoint is read-only; we only need to read the session.
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Load first child for this parent.
  const { data: child, error: childErr } = await supabase
    .from("children")
    .select("id, name, date_of_birth, therapy_goals")
    .eq("parent_id", user.id)
    .order("name", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (childErr || !child) {
    return NextResponse.json(
      { error: "No child profile found for this account yet." },
      { status: 404 }
    );
  }

  const row = child as {
    id: string;
    name: string;
    date_of_birth: string | null;
    therapy_goals: string[] | null;
  };

  const age = ageFromDob(row.date_of_birth ?? null);
  const goals = (row.therapy_goals ?? []).filter(Boolean);

  const result = await openAiDailyTip({ age, goals });

  return NextResponse.json({
    activity: result.activity,
    child: { id: row.id, name: row.name, age },
  });
}

