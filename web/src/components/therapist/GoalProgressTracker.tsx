"use client";

import { useMemo, useState, useTransition } from "react";
import type {
  Goal,
  GoalDomain,
  GoalProvider,
  GoalStatus,
} from "@/lib/db/goals";
import { saveGoalProgress } from "@/app/therapist/goals/actions";

const STATUS_ORDER: GoalStatus[] = [
  "Not started",
  "In progress",
  "Emerging",
  "Achieved",
];

type Props = {
  goals: Goal[];
  childId: string;
};

function domainStyles(domain: GoalDomain): {
  pillBgClass: string;
  pillTextClass: string;
  borderClass: string;
} {
  switch (domain) {
    case "Communication":
      return {
        pillBgClass: "bg-violet-50",
        pillTextClass: "text-violet-700",
        borderClass: "border-violet-200",
      };
    case "Behavior":
      return {
        pillBgClass: "bg-amber-50",
        pillTextClass: "text-amber-700",
        borderClass: "border-amber-200",
      };
    case "Motor":
      return {
        pillBgClass: "bg-blue-50",
        pillTextClass: "text-blue-700",
        borderClass: "border-blue-200",
      };
    case "Social":
      return {
        pillBgClass: "bg-teal-50",
        pillTextClass: "text-teal-700",
        borderClass: "border-teal-200",
      };
    case "Self-care":
      return {
        pillBgClass: "bg-emerald-50",
        pillTextClass: "text-emerald-700",
        borderClass: "border-emerald-200",
      };
    default:
      return {
        pillBgClass: "bg-slate-50",
        pillTextClass: "text-slate-700",
        borderClass: "border-slate-200",
      };
  }
}

function statusStyles(status: GoalStatus): {
  pillBgClass: string;
  pillTextClass: string;
  borderClass: string;
} {
  switch (status) {
    case "Not started":
      return {
        pillBgClass: "bg-slate-100",
        pillTextClass: "text-slate-700",
        borderClass: "border-slate-200",
      };
    case "In progress":
      return {
        pillBgClass: "bg-blue-50",
        pillTextClass: "text-blue-700",
        borderClass: "border-blue-200",
      };
    case "Emerging":
      return {
        pillBgClass: "bg-amber-50",
        pillTextClass: "text-amber-700",
        borderClass: "border-amber-200",
      };
    case "Achieved":
      return {
        pillBgClass: "bg-emerald-50",
        pillTextClass: "text-emerald-700",
        borderClass: "border-emerald-200",
      };
    default:
      return {
        pillBgClass: "bg-slate-100",
        pillTextClass: "text-slate-700",
        borderClass: "border-slate-200",
      };
  }
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return iso;
  }
}

function DotProgress({ level }: { level: number }) {
  const clamped = Math.min(5, Math.max(1, Math.round(level)));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= clamped;
        return (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={`h-2 w-2 rounded-full ${filled ? "bg-blue-400" : "bg-slate-200"}`}
          />
        );
      })}
    </div>
  );
}

function AvatarRow({ providers }: { providers: GoalProvider[] }) {
  if (!providers || providers.length === 0) {
    return <span className="text-xs font-semibold text-slate-400">—</span>;
  }
  const visible = providers.slice(0, 3);
  const extra = Math.max(0, providers.length - visible.length);

  return (
    <div className="flex items-center">
      {visible.map((p) => (
        <div
          key={p.id}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-white bg-slate-100 text-[11px] font-bold text-slate-700"
          title={p.name ?? p.initials}
          style={{ marginLeft: visible[0].id === p.id ? 0 : -10 }}
        >
          {p.initials}
        </div>
      ))}
      {extra > 0 && (
        <div className="ml-2 text-xs font-semibold text-slate-500">
          +{extra}
        </div>
      )}
    </div>
  );
}

export function GoalProgressTracker({ goals: initialGoals }: Props) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [openGoalId, setOpenGoalId] = useState<string | null>(null);

  const [noteByGoal, setNoteByGoal] = useState<Record<string, string>>({});
  const [statusByGoal, setStatusByGoal] = useState<Record<string, GoalStatus>>({});
  const [levelByGoal, setLevelByGoal] = useState<Record<string, number>>({});

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const openedGoal = useMemo(
    () => goals.find((g) => g.id === openGoalId) ?? null,
    [goals, openGoalId],
  );

  function seedPanel(goal: Goal) {
    setStatusByGoal((prev) => ({ ...prev, [goal.id]: goal.status }));
    setLevelByGoal((prev) => ({ ...prev, [goal.id]: goal.progressLevel }));
    setNoteByGoal((prev) => ({ ...prev, [goal.id]: prev[goal.id] ?? "" }));
  }

  function toggleGoal(goal: Goal) {
    if (openGoalId === goal.id) {
      setOpenGoalId(null);
      return;
    }
    seedPanel(goal);
    setError(null);
    setOpenGoalId(goal.id);
  }

  async function handleSave(goal: Goal) {
    const status = statusByGoal[goal.id] ?? goal.status;
    const progressLevel = levelByGoal[goal.id] ?? goal.progressLevel;
    const note = noteByGoal[goal.id] ?? "";

    setSavingId(goal.id);
    setError(null);

    startTransition(async () => {
      try {
        await saveGoalProgress({
          goalId: goal.id,
          status,
          progressLevel,
          note,
        });

        // Optimistic UI update. Real provider identities will come from check_ins.
        setGoals((prev) =>
          prev.map((g) =>
            g.id === goal.id
              ? {
                  ...g,
                  status,
                  progressLevel,
                  updatedAt: new Date().toISOString(),
                  providers: [
                    ...g.providers,
                    { id: "you", name: null, initials: "ME" },
                  ].slice(0, 4),
                }
              : g,
          ),
        );
        setOpenGoalId(null);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Could not save goal progress.");
      } finally {
        setSavingId(null);
      }
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Active goals
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Tap a goal to update status and progress.
          </p>
        </div>
        {goals.length > 0 && (
          <div className="rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
            {goals.length} goal{goals.length === 1 ? "" : "s"}
          </div>
        )}
      </div>

      {error && (
        <div
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {goals.length === 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 text-sm text-slate-600 md:col-span-2">
            No active goals found for this child yet.
          </div>
        )}

        {goals.map((goal) => {
          const isOpen = openGoalId === goal.id;
          const ds = domainStyles(goal.domain);
          const ss = statusStyles(goal.status);

          const panelMax = isOpen ? 260 : 0;
          const status = statusByGoal[goal.id] ?? goal.status;
          const level = levelByGoal[goal.id] ?? goal.progressLevel;
          const note = noteByGoal[goal.id] ?? "";

          return (
            <div key={goal.id} className="rounded-3xl">
              <button
                type="button"
                onClick={() => toggleGoal(goal)}
                className="w-full rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-[#BFDBFE] hover:bg-[#F8FAFF]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${ds.pillBgClass} ${ds.pillTextClass} ${ds.borderClass}`}
                      >
                        {goal.domain}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${ss.pillBgClass} ${ss.pillTextClass} ${ss.borderClass}`}
                      >
                        {goal.status}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      {goal.title}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <DotProgress level={goal.progressLevel} />
                      <p className="text-[12px] text-slate-500">
                        Last updated: {formatDate(goal.updatedAt)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="text-[12px] font-semibold text-slate-700">
                        Providers logged
                      </div>
                      <AvatarRow providers={goal.providers} />
                    </div>
                  </div>
                  <div
                    className={`mt-1 h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center ${
                      isOpen ? "text-[#3B82F6]" : "text-slate-500"
                    }`}
                    aria-hidden
                  >
                    {isOpen ? "×" : "+"}
                  </div>
                </div>
              </button>

              <div
                className={`overflow-hidden rounded-b-3xl transition-[max-height,opacity] duration-300 ease-out ${
                  isOpen ? "opacity-100" : "opacity-0"
                }`}
                style={{ maxHeight: panelMax }}
              >
                <div className="bg-[#F8FAFF] p-4">
                  <p className="text-sm font-semibold text-[#2563EB]">
                    Update this goal
                  </p>

                  <div className="mt-3 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Status
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {STATUS_ORDER.map((s) => {
                          const selected = status === s;
                          const styles = statusStyles(s);
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() =>
                                setStatusByGoal((prev) => ({
                                  ...prev,
                                  [goal.id]: s,
                                }))
                              }
                              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-slate-50 ${
                                selected
                                  ? `${styles.pillBgClass} ${styles.pillTextClass} ${styles.borderClass}`
                                  : "border-slate-200 bg-white text-slate-700"
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Progress level
                      </p>
                      <div className="mt-2">
                        <input
                          type="range"
                          min={1}
                          max={5}
                          step={1}
                          value={level}
                          onChange={(e) =>
                            setLevelByGoal((prev) => ({
                              ...prev,
                              [goal.id]: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-[#3B82F6]"
                        />
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                          <span>1</span>
                          <span className="font-semibold text-slate-900">
                            {level} / 5
                          </span>
                          <span>5</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Provider note (brief)
                      </p>
                      <textarea
                        value={note}
                        onChange={(e) =>
                          setNoteByGoal((prev) => ({
                            ...prev,
                            [goal.id]: e.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="What did you observe? Any context?"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-[#3B82F6]"
                      />
                    </div>

                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
                      <button
                        type="button"
                        onClick={() => setOpenGoalId(null)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(goal)}
                        disabled={isPending && savingId === goal.id}
                        className="rounded-full bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {savingId === goal.id ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

