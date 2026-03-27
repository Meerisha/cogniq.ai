import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

export type ChildHeaderProvider = {
  id: string;
  name: string | null;
  initials: string;
};

export type ChildProfileHeader = {
  childId: string;
  firstName: string;
  fullName: string;
  ageYears: number | null;
  activeGoalCount: number;
  providers: ChildHeaderProvider[];
  lastUpdatedAt: string | null;
};

export type MoodTrendPoint = {
  date: string;
  moodScore: number;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  const raw = `${first}${last}`.toUpperCase();
  return raw || "?";
}

function firstNameFromFull(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts[0] ?? name;
}

function ageFromDob(dobIso: string | null): number | null {
  if (!dobIso) return null;
  const dob = new Date(dobIso);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/** Goals that are still being actively worked (not marked achieved). */
function isActiveGoalStatus(status: string | null | undefined): boolean {
  if (!status) return true;
  return status.trim().toLowerCase() !== "achieved";
}

function latestTimestampIso(
  dates: (string | null | undefined)[]
): string | null {
  let bestMs: number | null = null;
  for (const d of dates) {
    if (!d) continue;
    const ms = new Date(d).getTime();
    if (Number.isNaN(ms)) continue;
    if (bestMs === null || ms > bestMs) bestMs = ms;
  }
  return bestMs != null ? new Date(bestMs).toISOString() : null;
}

function mockChildProfileHeader(childId: string): ChildProfileHeader {
  return {
    childId,
    firstName: "Jordan",
    fullName: "Jordan Lee",
    ageYears: 7,
    activeGoalCount: 3,
    providers: [
      { id: "mock-1", name: "Alex Morgan", initials: "AM" },
      { id: "mock-2", name: "Taylor Kim", initials: "TK" },
    ],
    lastUpdatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  };
}

function startOfDayIso(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function clampMoodScore(value: number): number {
  if (Number.isNaN(value)) return 3;
  return Math.min(5, Math.max(1, Math.round(value)));
}

export async function getMoodTrend30Days(childId: string): Promise<MoodTrendPoint[]> {
  if (!childId) return [];

  const supabase = createSupabaseServerClient();
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 29);
  const sinceIso = startOfDayIso(start);

  try {
    const { data, error } = await supabase
      .from("parent_checkins")
      .select("date, mood_score")
      .eq("child_id", childId)
      .gte("date", sinceIso.slice(0, 10))
      .order("date", { ascending: true });

    if (error) {
      console.error("getMoodTrend30Days error", error);
      const mock: MoodTrendPoint[] = [];
      for (let i = 0; i < 8; i++) {
        const day = new Date(now);
        day.setDate(now.getDate() - (7 - i) * 3);
        mock.push({
          date: day.toISOString().slice(0, 10),
          moodScore: [2, 3, 3, 4, 3, 4, 5, 4][i] ?? 3,
        });
      }
      return mock;
    }

    if (!data) return [];

    const rows = data as { date?: string; mood_score?: number | null }[];
    const points: MoodTrendPoint[] = rows
      .map((r) => {
        if (!r.date || r.mood_score == null) return null;
        return {
          date: r.date,
          moodScore: clampMoodScore(Number(r.mood_score)),
        };
      })
      .filter((p): p is MoodTrendPoint => !!p);

    return points;
  } catch (err) {
    console.error("getMoodTrend30Days unexpected", err);
    return [];
  }
}

/**
 * Header data for the provider child profile: demographics, active goals,
 * linked providers via `provider_child` → `users`, and a latest-change hint.
 */
export async function getChildProfileHeader(
  childId: string
): Promise<ChildProfileHeader | null> {
  if (!childId) return null;

  const supabase = createSupabaseServerClient();

  try {
    const { data: childRow, error: childError } = await supabase
      .from("children")
      .select("id, name, dob")
      .eq("id", childId)
      .maybeSingle();

    if (childError) {
      console.error("getChildProfileHeader child error", childError);
      return mockChildProfileHeader(childId);
    }

    if (!childRow) {
      return null;
    }

    const child = childRow as {
      id: string;
      name: string | null;
      dob: string | null;
    };

    let activeGoalCount = 0;
    let latestGoalUpdate: string | null = null;

    const { data: goalRows, error: goalsError } = await supabase
      .from("goals")
      .select("status, updated_at")
      .eq("child_id", childId);

    if (!goalsError && goalRows) {
      for (const g of goalRows as { status?: string; updated_at?: string }[]) {
        if (isActiveGoalStatus(g.status)) activeGoalCount++;
        if (g.updated_at) {
          latestGoalUpdate = latestTimestampIso([latestGoalUpdate, g.updated_at]);
        }
      }
    } else if (goalsError) {
      console.error("getChildProfileHeader goals error", goalsError);
    }

    let latestCheckinDate: string | null = null;
    const { data: checkinRow, error: checkinError } = await supabase
      .from("parent_checkins")
      .select("date")
      .eq("child_id", childId)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!checkinError && checkinRow) {
      const row = checkinRow as { date?: string };
      if (row.date) {
        const d = new Date(row.date);
        latestCheckinDate = Number.isNaN(d.getTime()) ? null : d.toISOString();
      }
    }

    const { data: links, error: linksError } = await supabase
      .from("provider_child")
      .select("provider_id")
      .eq("child_id", childId);

    const providers: ChildHeaderProvider[] = [];

    if (!linksError && links && links.length > 0) {
      const providerIds = [
        ...new Set(
          (links as { provider_id: string }[])
            .map((l) => l.provider_id)
            .filter(Boolean)
        ),
      ];

      if (providerIds.length > 0) {
        const { data: userRows, error: usersError } = await supabase
          .from("users")
          .select("id, name")
          .in("id", providerIds);

        if (!usersError && userRows) {
          const unsorted = (userRows as { id: string; name: string | null }[]).map(
            (u) => ({
              id: u.id,
              name: u.name,
              initials: u.name
                ? initialsFromName(u.name)
                : u.id.replace(/-/g, "").slice(0, 2).toUpperCase() || "?",
            })
          );
          unsorted.sort((a, b) =>
            (a.name ?? a.id).localeCompare(b.name ?? b.id)
          );
          providers.push(...unsorted);
        }
      }
    } else if (linksError) {
      console.error("getChildProfileHeader provider_child error", linksError);
    }

    const lastUpdatedAt = latestTimestampIso([
      latestGoalUpdate,
      latestCheckinDate,
    ]);

    return {
      childId: child.id,
      firstName: firstNameFromFull(child.name ?? ""),
      fullName: child.name ?? "Child",
      ageYears: ageFromDob(child.dob ?? null),
      activeGoalCount,
      providers,
      lastUpdatedAt,
    };
  } catch (err) {
    console.error("getChildProfileHeader unexpected", err);
    return mockChildProfileHeader(childId);
  }
}
