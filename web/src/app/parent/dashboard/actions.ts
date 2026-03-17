"use server";

import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { requireParent } from "@/lib/auth/auth";

export type Activity = {
  title: string;
  description: string;
};

export async function submitDailyCheckIn(payload: {
  mood_score: number;
  behaviors_observed: string;
  skills_practiced_at_home: string;
  notes: string;
}): Promise<{ activities: Activity[] }> {
  const user = await requireParent();
  const supabase = createSupabaseServerClient();

  // TODO: once the `children` and `provider_child` tables are wired,
  // select the active child for this parent. For now, this is a stub.
  const { data: child, error: childError } = await supabase
    .from("children")
    .select("id")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (childError) {
    console.error("Error fetching child for parent", childError);
    throw new Error("Unable to load your child profile right now.");
  }

  if (!child) {
    throw new Error(
      "We could not find a child profile for your account yet. Please ask your care team to connect you.",
    );
  }

  const today = new Date();
  const dateOnly = today.toISOString().slice(0, 10);

  const { error } = await supabase.from("parent_checkins").insert({
    child_id: child.id,
    date: dateOnly,
    mood_score: payload.mood_score,
    behaviors_observed: payload.behaviors_observed || null,
    skills_practiced_at_home: payload.skills_practiced_at_home || null,
    notes: payload.notes || null,
  });

  if (error) {
    console.error("Error inserting parent_checkin", error);
    throw new Error("Failed to save check-in.");
  }

  // After saving, call the AI activities endpoint to get ideas for today.
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/ai/activities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      childId: child.id,
      moodScore: payload.mood_score,
    }),
    cache: "no-store",
  }).catch((err) => {
    console.error("Error calling activities endpoint", err);
    return null;
  });

  if (!response || !response.ok) {
    return { activities: [] };
  }

  const data = (await response.json().catch(() => null)) as
    | { activities?: Activity[] }
    | null;

  return {
    activities: data?.activities ?? [],
  };
}

