import { getActiveGoalsForChild } from "@/lib/db/goals";
import { GoalProgressTracker } from "@/components/therapist/GoalProgressTracker";

export default async function TherapistGoalsPage({
  searchParams,
}: {
  searchParams: { childId?: string | string[] };
}) {
  const rawChildId = searchParams.childId ?? "";
  const childId = Array.isArray(rawChildId) ? rawChildId[0] : rawChildId;
  const goals = await getActiveGoalsForChild(childId);

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold text-emerald-800">
        Goal progress tracker
      </h1>
      <p className="text-sm text-slate-600">
        Update goals in one place. Tap a goal card to edit status, progress
        level (1–5), and add a brief note.
      </p>
      <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm text-slate-500">
        <GoalProgressTracker goals={goals} childId={childId} />
      </div>
    </section>
  );
}

