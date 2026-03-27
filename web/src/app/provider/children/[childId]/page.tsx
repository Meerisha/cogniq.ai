import { notFound } from "next/navigation";
import {
  getChildProfileHeader,
  getMoodTrend30Days,
  type ChildHeaderProvider,
  type MoodTrendPoint,
} from "@/lib/db/providerChild";

function formatLastUpdated(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function ProviderAvatarRow({ providers }: { providers: ChildHeaderProvider[] }) {
  if (providers.length === 0) {
    return (
      <span className="text-xs text-slate-400">
        No linked providers in directory yet
      </span>
    );
  }

  const visible = providers.slice(0, 5);
  const extra = providers.length - visible.length;

  return (
    <div className="flex items-center pt-0.5">
      {visible.map((p, i) => (
        <div
          key={p.id}
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[11px] font-semibold tracking-tight text-slate-700 shadow-sm"
          title={p.name ?? p.initials}
          style={{ marginLeft: i === 0 ? 0 : -10 }}
        >
          {p.initials}
        </div>
      ))}
      {extra > 0 && (
        <span
          className="ml-2 text-xs font-medium text-slate-500"
          title={`${extra} more`}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}

function moodLabel(score: number): string {
  switch (score) {
    case 1:
      return "Very low";
    case 2:
      return "Low";
    case 3:
      return "Steady";
    case 4:
      return "Good";
    case 5:
      return "Great";
    default:
      return "Steady";
  }
}

function MoodTrendChart({ points }: { points: MoodTrendPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
        No mood check-ins in the last 30 days yet.
      </div>
    );
  }

  const width = 520;
  const height = 180;
  const xStep = points.length > 1 ? width / (points.length - 1) : width;
  const yForScore = (score: number) => ((5 - score) / 4) * (height - 12) + 6;

  const polyline = points
    .map((p, i) => `${i * xStep},${yForScore(p.moodScore)}`)
    .join(" ");

  const latest = points[points.length - 1];
  const latestDate = latest?.date ? new Date(latest.date) : null;
  const latestDateLabel =
    latestDate && !Number.isNaN(latestDate.getTime())
      ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
          latestDate
        )
      : "today";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-100 bg-[#F6FAFF] px-3 py-3 sm:px-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full">
          {[1, 2, 3, 4, 5].map((level) => (
            <line
              key={level}
              x1={0}
              y1={yForScore(level)}
              x2={width}
              y2={yForScore(level)}
              stroke={level === 3 ? "#D6E6FF" : "#EEF3FB"}
              strokeWidth={1}
            />
          ))}
          <polyline
            points={polyline}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => (
            <circle
              key={`${p.date}-${i}`}
              cx={i * xStep}
              cy={yForScore(p.moodScore)}
              r={i === points.length - 1 ? 4 : 2.8}
              fill={i === points.length - 1 ? "#2563EB" : "#60A5FA"}
            />
          ))}
        </svg>
      </div>
      <p className="text-sm text-slate-600">
        Latest mood:{" "}
        <span className="font-medium text-slate-800">
          {moodLabel(latest?.moodScore ?? 3)} ({latest?.moodScore ?? 3}/5)
        </span>{" "}
        on {latestDateLabel}
      </p>
    </div>
  );
}

type PageProps = {
  params: Promise<{ childId: string }>;
};

export default async function ProviderChildPage({ params }: PageProps) {
  const { childId } = await params;
  const [header, moodTrend] = await Promise.all([
    getChildProfileHeader(childId),
    getMoodTrend30Days(childId),
  ]);

  if (!header) {
    notFound();
  }

  const ageLabel =
    header.ageYears != null
      ? `${header.ageYears} year${header.ageYears === 1 ? "" : "s"} old`
      : "Age not on file";
  const updatedLabel = formatLastUpdated(header.lastUpdatedAt);

  return (
    <div className="space-y-10">
      <section
        aria-labelledby="child-header-title"
        className="rounded-2xl border border-emerald-100/80 bg-white/90 px-5 py-6 shadow-sm sm:px-7"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1
              id="child-header-title"
              className="text-2xl font-semibold tracking-tight text-emerald-950 sm:text-[1.65rem]"
            >
              {header.firstName}
              <span className="text-lg font-normal text-slate-500 sm:text-xl">
                {" "}
                · {ageLabel}
              </span>
            </h1>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-800">
                {header.activeGoalCount}
              </span>{" "}
              active goal{header.activeGoalCount === 1 ? "" : "s"}
            </p>
          </div>

          {updatedLabel ? (
            <p className="text-xs font-medium text-slate-400 sm:text-right sm:pt-1">
              Last updated{" "}
              <time dateTime={header.lastUpdatedAt ?? undefined}>
                {updatedLabel}
              </time>
            </p>
          ) : (
            <p className="text-xs font-medium text-slate-400 sm:text-right sm:pt-1">
              No recent goal or check-in updates
            </p>
          )}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Care team
          </p>
          <div className="mt-2">
            <ProviderAvatarRow providers={header.providers} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-blue-100/80 bg-white/90 px-5 py-6 shadow-sm sm:px-7">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Mood trend (last 30 days)
            </h2>
            <p className="text-sm text-slate-600">
              Quick view from parent check-ins.
            </p>
          </div>
        </div>
        <MoodTrendChart points={moodTrend} />
      </section>
    </div>
  );
}
