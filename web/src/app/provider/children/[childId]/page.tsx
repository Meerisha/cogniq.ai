import { notFound } from "next/navigation";
import {
  getChildProfileHeader,
  type ChildHeaderProvider,
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

type PageProps = {
  params: Promise<{ childId: string }>;
};

export default async function ProviderChildPage({ params }: PageProps) {
  const { childId } = await params;
  const header = await getChildProfileHeader(childId);

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
    </div>
  );
}
