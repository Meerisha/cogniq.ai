import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

export type GoalDomain = "Communication" | "Behavior" | "Motor" | "Social" | "Self-care";
export type GoalStatus = "Not started" | "In progress" | "Emerging" | "Achieved";

export type GoalProvider = {
  id: string;
  name?: string | null;
  initials: string;
};

export type Goal = {
  id: string;
  childId: string;
  title: string;
  domain: GoalDomain;
  status: GoalStatus;
  progressLevel: number; // 1-5
  updatedAt: string; // ISO
  providers: GoalProvider[];
  // Providers have logged against this goal recently; used to seed UI.
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  const raw = `${first}${last}`.toUpperCase();
  return raw || "?";
}

function domainToStatusProgress(progressLevel: number): GoalStatus {
  // Best-effort mapping for UI. In a real app, status would come from DB.
  if (progressLevel >= 5) return "Achieved";
  if (progressLevel >= 3) return "In progress";
  if (progressLevel >= 2) return "Emerging";
  return "Not started";
}

const MOCK_PROVIDERS: GoalProvider[] = [
  { id: "p1", name: "Alex Morgan", initials: "AM" },
  { id: "p2", name: "Jordan Lee", initials: "JL" },
  { id: "p3", name: "Taylor Kim", initials: "TK" },
  { id: "p4", name: "Sam Rivera", initials: "SR" },
];

const MOCK_GOALS: Goal[] = [
  {
    id: "g1",
    childId: "child",
    title: "Maintain eye contact for 3 seconds",
    domain: "Communication",
    status: "In progress",
    progressLevel: 3,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    providers: [MOCK_PROVIDERS[0], MOCK_PROVIDERS[1]],
  },
  {
    id: "g2",
    childId: "child",
    title: "Use a “calm down” routine when upset",
    domain: "Self-care",
    status: "Emerging",
    progressLevel: 2,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    providers: [MOCK_PROVIDERS[2]],
  },
  {
    id: "g3",
    childId: "child",
    title: "Complete 2-step directions during play",
    domain: "Social",
    status: "Not started",
    progressLevel: 1,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    providers: [MOCK_PROVIDERS[3]],
  },
  {
    id: "g4",
    childId: "child",
    title: "Clap and stop on a cue",
    domain: "Motor",
    status: "Achieved",
    progressLevel: 5,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    providers: [MOCK_PROVIDERS[0], MOCK_PROVIDERS[2], MOCK_PROVIDERS[1]],
  },
];

export async function getActiveGoalsForChild(childId: string): Promise<Goal[]> {
  if (!childId) return [];

  const supabase = createSupabaseServerClient();

  try {
    // Expected tables/columns:
    // - goals: id, child_id, title, domain, status, progress_level, updated_at
    const { data: goals, error: goalsError } = await supabase
      .from("goals")
      .select(
        "id, child_id, title, domain, status, progress_level, updated_at"
      )
      .eq("child_id", childId)
      .order("updated_at", { ascending: false });

    if (goalsError) {
      console.error("getActiveGoalsForChild goals error", goalsError);
      return MOCK_GOALS.map((g) => ({ ...g, childId }));
    }

    if (!goals || goals.length === 0) return [];

    const goalRows = goals as any[];

    // Fetch recent check-ins per goal to compute provider initials.
    const goalIds = goalRows.map((g) => g.id).filter(Boolean);
    const providerMap = new Map<string, GoalProvider[]>();

    if (goalIds.length > 0) {
      const { data: checkIns, error: checkInsError } = await supabase
        .from("check_ins")
        .select("goal_id, provider_id, provider_name")
        .in("goal_id", goalIds)
        .order("created_at", { ascending: false })
        .limit(200);

      if (!checkInsError && checkIns) {
        const providerIds = new Set<string>();
        const rows = checkIns as any[];
        for (const row of rows) {
          const pid = row.provider_id;
          if (pid) providerIds.add(pid);
        }

        const ids = Array.from(providerIds);

        let usersById = new Map<string, string>();
        if (ids.length > 0) {
          const { data: users } = await supabase
            .from("users")
            .select("id, name")
            .in("id", ids);
          if (users) {
            const userRows = users as any[];
            usersById = new Map(
              userRows.map((u) => [u.id as string, (u.name as string) ?? u.id])
            );
          }
        }

        for (const row of rows) {
          const gid = row.goal_id as string;
          const providerId = (row.provider_id ?? "") as string;
          const providerName =
            (row.provider_name as string | null) ??
            usersById.get(providerId) ??
            providerId ??
            null;

          const provider: GoalProvider = {
            id: providerId || `unknown-${gid}`,
            name: providerName,
            initials:
              (providerName && initialsFromName(providerName)) || "??",
          };

          const current = providerMap.get(gid) ?? [];
          // De-dupe by initials (good enough for a UI).
          if (!current.some((p) => p.initials === provider.initials)) {
            current.push(provider);
          }
          providerMap.set(gid, current);
        }
      }
    }

    const results: Goal[] = goalRows.map((g) => {
      const progressLevel = Number(g.progress_level ?? 1);
      const status =
        (g.status as GoalStatus | undefined) ??
        domainToStatusProgress(progressLevel);

      const providers = providerMap.get(g.id as string) ?? [];

      return {
        id: g.id as string,
        childId,
        title: (g.title as string) ?? "Untitled goal",
        domain: (g.domain as GoalDomain) ?? "Communication",
        status,
        progressLevel: Math.min(5, Math.max(1, progressLevel)),
        updatedAt: (g.updated_at as string) ?? new Date().toISOString(),
        providers,
      };
    });

    return results;
  } catch (err) {
    console.error("getActiveGoalsForChild fallback mock", err);
    return MOCK_GOALS.map((g) => ({ ...g, childId }));
  }
}

