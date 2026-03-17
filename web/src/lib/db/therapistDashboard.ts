import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { requireTherapist } from "@/lib/auth/auth";

type ChildRow = {
  id: string;
  name: string;
  dob: string | null;
};

type LatestCheckIn = {
  date: string;
  mood_score: number | null;
};

export type TherapistDashboardChild = {
  id: string;
  name: string;
  lastCheckIn?: LatestCheckIn | null;
  hasRecentFlag: boolean;
};

export async function getTherapistDashboardChildren(): Promise<TherapistDashboardChild[]> {
  const therapist = await requireTherapist();
  const supabase = createSupabaseServerClient();

  // Find children linked to this provider via provider_child
  const { data: providerLinks, error: providerError } = await supabase
    .from("provider_child")
    .select("child_id")
    .eq("provider_id", therapist.id);

  if (providerError) {
    console.error("Error loading provider_child links", providerError);
    throw new Error("Unable to load your children right now.");
  }

  if (!providerLinks || providerLinks.length === 0) {
    return [];
  }

  const childIds = providerLinks.map((link) => link.child_id);

  // Load child basics
  const { data: children, error: childrenError } = await supabase
    .from("children")
    .select("id, name, dob")
    .in("id", childIds);

  if (childrenError) {
    console.error("Error loading children", childrenError);
    throw new Error("Unable to load child profiles.");
  }

  if (!children || children.length === 0) {
    return [];
  }

  // Load latest parent_checkins per child for a quick snapshot
  const { data: checkins, error: checkinsError } = await supabase
    .from("parent_checkins")
    .select("child_id, date, mood_score")
    .in("child_id", childIds)
    .order("date", { ascending: false });

  if (checkinsError) {
    console.error("Error loading parent_checkins", checkinsError);
  }

  const latestByChild = new Map<string, LatestCheckIn>();
  if (checkins) {
    for (const row of checkins) {
      if (!latestByChild.has(row.child_id)) {
        latestByChild.set(row.child_id, {
          date: row.date,
          mood_score: row.mood_score,
        });
      }
    }
  }

  // Simple flag logic for now:
  // - hasRecentFlag = true if latest mood_score is 1 or 2.
  return children.map((child: ChildRow) => {
    const latest = latestByChild.get(child.id) ?? null;
    const hasRecentFlag =
      latest?.mood_score != null && latest.mood_score <= 2 ? true : false;

    return {
      id: child.id,
      name: child.name,
      lastCheckIn: latest,
      hasRecentFlag,
    };
  });
}

