import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type Body = { progress_notes?: string };

async function getCookieStore() {
  const c = cookies() as any;
  return typeof c?.then === "function" ? await c : c;
}

function fallbackSummary(progressNotes: string) {
  const trimmed = progressNotes.trim();
  if (!trimmed) {
    return "Today we focused on small, steady steps and lots of encouragement. Your child had moments of great effort, and we’ll keep building on them next time.";
  }
  return "Today we practiced key skills through simple activities and gentle support. Your child showed effort and made progress in small, meaningful ways—thank you for being part of the team.";
}

async function openAiSummary(progressNotes: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { summary: fallbackSummary(progressNotes), usedAi: false };

  const system =
    "You are a helpful assistant that translates therapy session notes into warm, plain-language summaries for parents. Use simple words, be encouraging, highlight what the child did well. Never use clinical jargon. Max 3 sentences.";

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
        { role: "user", content: progressNotes },
      ],
      temperature: 0.6,
      max_tokens: 130,
    }),
  });

  if (!resp.ok) return { summary: fallbackSummary(progressNotes), usedAi: false };
  const json = (await resp.json().catch(() => null)) as any;
  const text = String(json?.choices?.[0]?.message?.content ?? "").trim();
  return { summary: text || fallbackSummary(progressNotes), usedAi: true };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  const progressNotes = String(body?.progress_notes ?? "").trim();
  if (!progressNotes) {
    return NextResponse.json({ error: "Missing progress_notes" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
  }

  const cookieStore = await getCookieStore();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // No-op: read-only auth check for this endpoint.
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Must be therapist
  const { data: me, error: meErr } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (meErr) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (me as { role?: string | null } | null)?.role ?? null;
  if (role !== "therapist" && role !== "admin") {
    return NextResponse.json({ error: "Therapist access required" }, { status: 403 });
  }

  const result = await openAiSummary(progressNotes);
  return NextResponse.json({ summary: result.summary });
}

