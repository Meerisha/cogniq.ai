"use server";

import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import type { GoalStatus } from "@/lib/db/goals";

export async function saveGoalProgress(payload: {
  goalId: string;
  status: GoalStatus;
  progressLevel: number; // 1-5
  note: string;
}): Promise<{ ok: true }> {
  const supabase = createSupabaseServerClient();

  const progressLevel = Math.min(5, Math.max(1, Math.round(payload.progressLevel)));

  // Update the goal row
  const { error: updateError } = await supabase
    .from("goals")
    .update({
      status: payload.status,
      progress_level: progressLevel,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.goalId);

  if (updateError) {
    console.error("saveGoalProgress update goals error", updateError);
    throw new Error("Could not save goal progress.");
  }

  // Insert a goal check-in row
  // Expected columns: goal_id, provider_id, status, progress_level, note, created_at
  // Note: in this first iteration we don’t attach provider identity (RLS/auth wiring comes next).
  const { error: insertError } = await supabase.from("check_ins").insert({
    goal_id: payload.goalId,
    provider_id: null,
    provider_name: null,
    status: payload.status,
    progress_level: progressLevel,
    note: payload.note || null,
    created_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error("saveGoalProgress insert check_ins error", insertError);
    // Goals already updated; don’t fail the whole request.
    return { ok: true };
  }

  return { ok: true };
}

