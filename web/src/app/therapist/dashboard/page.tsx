import { getTherapistDashboardChildren } from "@/lib/db/therapistDashboard";
import { ChildListTable } from "@/components/therapist/ChildListTable";

export default async function TherapistDashboardPage() {
  const children = await getTherapistDashboardChildren();

  const flaggedCount = children.filter((c) => c.hasRecentFlag).length;

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold text-emerald-800">
        Children Overview
      </h1>
      <p className="text-sm text-slate-600">
        A unified view of your assigned learners, recent home mood, and quick
        links into each child&apos;s profile and goals.
      </p>
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-slate-700">
            {children.length} child
            {children.length === 1 ? "" : "ren"} on your caseload
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-slate-700">
            {flaggedCount} needing a closer look (low home mood)
          </span>
        </div>
      </div>
      <ChildListTable childrenData={children} />
    </section>
  );
}

