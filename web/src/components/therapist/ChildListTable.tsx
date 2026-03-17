import Link from "next/link";
import type { TherapistDashboardChild } from "@/lib/db/therapistDashboard";

type Props = {
  childrenData: TherapistDashboardChild[];
};

export function ChildListTable({ childrenData }: Props) {
  if (childrenData.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        No children are linked to your account yet. Once your clinic connects
        you to learners, they will appear here.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white text-sm">
      <div className="grid grid-cols-[1.5fr,1.2fr,1fr,0.9fr] border-b border-emerald-50 bg-emerald-50/60 px-3 py-2 text-xs font-semibold text-emerald-900">
        <div>Child</div>
        <div>Last check-in</div>
        <div>Home mood</div>
        <div>Actions</div>
      </div>
      <ul className="divide-y divide-emerald-50">
        {childrenData.map((child) => (
          <li
            key={child.id}
            className="grid grid-cols-[1.5fr,1.2fr,1fr,0.9fr] items-center px-3 py-2 text-xs text-slate-700"
          >
            <div className="flex flex-col">
              <span className="font-medium text-slate-900">
                {child.name || "Unnamed learner"}
              </span>
              {child.hasRecentFlag && (
                <span className="mt-0.5 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  Needs attention
                </span>
              )}
            </div>
            <div>
              {child.lastCheckIn ? (
                <span>{child.lastCheckIn.date}</span>
              ) : (
                <span className="text-slate-400">No check-ins yet</span>
              )}
            </div>
            <div>
              {child.lastCheckIn?.mood_score != null ? (
                <span>{child.lastCheckIn.mood_score} / 5</span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/therapist/child/${child.id}`}
                className="rounded-full bg-emerald-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-600"
              >
                Open profile
              </Link>
              <Link
                href={`/therapist/goals?childId=${child.id}`}
                className="rounded-full border border-emerald-200 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Goals
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

