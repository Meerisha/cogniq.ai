"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const BRAND = {
  primary: "#2D6A4F",
  accent: "#F4A261",
  bg: "#FAFAF8",
};

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | string;

type BookingRow = {
  id: string;
  parent_id: string | null;
  therapist_id: string | null;
  child_id: string | null;
  session_type: string | null;
  session_date: string | null;
  duration_minutes: number | null;
  status: BookingStatus | null;
  price_cents: number | null;
};

type UserMini = { id: string; full_name: string | null };
type ChildMini = { id: string; name: string | null };

type BookingView = {
  id: string;
  parentName: string;
  childName: string;
  sessionType: string;
  sessionDate: string | null;
  durationMinutes: number | null;
  status: BookingStatus;
  priceCents: number | null;
};

function formatToday(now = new Date()) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(
    now
  );
}

function timeLabel(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(d);
}

function money(cents: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(cents / 100);
}

function startOfTodayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function endOfTodayIso() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function startOfMonthIso() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function sessionTypeParts(session_type: string | null) {
  const s = (session_type ?? "").toLowerCase();
  const hasVirtual = s.includes("virtual") || s.includes("both");
  const hasInPerson = s.includes("in-person") || s.includes("in person") || s.includes("both");
  return { hasVirtual, hasInPerson };
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M4.5 8.5h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 12.2 21 9.6v8.8l-4.5-2.6v-3.6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 13.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function TypeIcon({ sessionType }: { sessionType: string }) {
  const p = sessionTypeParts(sessionType);
  return (
    <div className="flex items-center gap-1.5 text-slate-600">
      {p.hasVirtual ? (
        <span title="Virtual">
          <CameraIcon />
        </span>
      ) : null}
      {p.hasInPerson ? (
        <span title="In-person">
          <PinIcon />
        </span>
      ) : null}
    </div>
  );
}

function StatusChip({ status }: { status: BookingStatus }) {
  const s = (status ?? "").toLowerCase();
  const cls =
    s === "confirmed"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : s === "cancelled"
        ? "bg-rose-50 text-rose-800 border-rose-200"
        : s === "pending"
          ? "bg-amber-50 text-amber-900 border-amber-200"
          : "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

export default function TherapistDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("there");
  const [todaySchedule, setTodaySchedule] = useState<BookingView[]>([]);
  const [pending, setPending] = useState<BookingView[]>([]);
  const [earnedThisMonthCents, setEarnedThisMonthCents] = useState(0);

  const [isPendingAction, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const todayLabel = useMemo(() => formatToday(), []);

  async function loadAll() {
    setLoading(true);
    setError(null);
    setActionError(null);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      setError("Please sign in to view your dashboard.");
      setLoading(false);
      return;
    }

    const { data: me } = await supabase.from("users").select("full_name").eq("id", user.id).maybeSingle();
    const fullName = (me as { full_name?: string | null } | null)?.full_name ?? null;
    setName(fullName?.split(" ")[0] ?? "there");

    const todayStart = startOfTodayIso();
    const todayEnd = endOfTodayIso();
    const monthStart = startOfMonthIso();

    // 1) Today's schedule
    const { data: todayRows, error: todayErr } = await supabase
      .from("bookings")
      .select("id, parent_id, child_id, session_type, session_date, duration_minutes, status, price_cents")
      .eq("therapist_id", user.id)
      .gte("session_date", todayStart)
      .lte("session_date", todayEnd)
      .order("session_date", { ascending: true });

    // 2) Pending requests
    const { data: pendingRows, error: pendingErr } = await supabase
      .from("bookings")
      .select("id, parent_id, child_id, session_type, session_date, duration_minutes, status, price_cents")
      .eq("therapist_id", user.id)
      .eq("status", "pending")
      .order("session_date", { ascending: true })
      .limit(20);

    // 3) Earnings this month (completed)
    const { data: completedRows, error: completedErr } = await supabase
      .from("bookings")
      .select("price_cents, session_date")
      .eq("therapist_id", user.id)
      .eq("status", "completed")
      .gte("session_date", monthStart)
      .lte("session_date", todayEnd)
      .limit(1000);

    if (todayErr || pendingErr || completedErr) {
      setError("Unable to load your dashboard right now.");
      setLoading(false);
      return;
    }

    const mergeBookings = (rows: any[] | null | undefined): BookingRow[] =>
      (rows ?? []).map((r) => ({
        id: String(r.id),
        parent_id: (r.parent_id ?? null) as string | null,
        therapist_id: user.id,
        child_id: (r.child_id ?? null) as string | null,
        session_type: (r.session_type ?? null) as string | null,
        session_date: (r.session_date ?? null) as string | null,
        duration_minutes: (r.duration_minutes ?? null) as number | null,
        status: (r.status ?? null) as BookingStatus | null,
        price_cents: (r.price_cents ?? null) as number | null,
      }));

    const todayList = mergeBookings(todayRows as any[]);
    const pendingList = mergeBookings(pendingRows as any[]);

    const parentIds = Array.from(
      new Set([...todayList, ...pendingList].map((b) => b.parent_id).filter(Boolean))
    ) as string[];
    const childIds = Array.from(
      new Set([...todayList, ...pendingList].map((b) => b.child_id).filter(Boolean))
    ) as string[];

    let parentsById = new Map<string, UserMini>();
    let childrenById = new Map<string, ChildMini>();

    if (parentIds.length > 0) {
      const { data: parents } = await supabase.from("users").select("id, full_name").in("id", parentIds);
      if (parents) {
        for (const p of parents as any[]) {
          parentsById.set(String(p.id), { id: String(p.id), full_name: p.full_name ?? null });
        }
      }
    }

    if (childIds.length > 0) {
      const { data: kids } = await supabase.from("children").select("id, name").in("id", childIds);
      if (kids) {
        for (const c of kids as any[]) {
          childrenById.set(String(c.id), { id: String(c.id), name: c.name ?? null });
        }
      }
    }

    const toView = (b: BookingRow): BookingView => ({
      id: b.id,
      parentName: (b.parent_id && parentsById.get(b.parent_id)?.full_name) || "Parent",
      childName: (b.child_id && childrenById.get(b.child_id)?.name) || "Child",
      sessionType: b.session_type ?? "virtual",
      sessionDate: b.session_date ?? null,
      durationMinutes: b.duration_minutes ?? null,
      status: (b.status ?? "pending") as BookingStatus,
      priceCents: b.price_cents ?? null,
    });

    setTodaySchedule(todayList.map(toView));
    setPending(pendingList.map(toView));

    const totalCents = ((completedRows ?? []) as any[]).reduce((sum, r) => sum + Number(r.price_cents ?? 0), 0);
    setEarnedThisMonthCents(Math.round(totalCents * 0.85));

    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateBookingStatus(id: string, status: "confirmed" | "cancelled") {
    setActionError(null);
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error: updErr } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (updErr) {
        setActionError(updErr.message ?? "Could not update booking.");
        return;
      }
      await loadAll();
    });
  }

  return (
    <div style={{ backgroundColor: BRAND.bg }} className="min-h-[calc(100vh-56px)]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            <div className="h-28 animate-pulse rounded-3xl border border-slate-200 bg-white/70" />
            <div className="h-60 animate-pulse rounded-3xl border border-slate-200 bg-white/70" />
            <div className="h-60 animate-pulse rounded-3xl border border-slate-200 bg-white/70" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Header */}
            <section className="rounded-3xl border border-emerald-100/70 bg-white/90 p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1
                    className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
                    style={{ fontFamily: "var(--font-dm-serif)" }}
                  >
                    Welcome back, {name}
                  </h1>
                  <p className="mt-2 text-sm text-slate-600 sm:text-base">{todayLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={loadAll}
                  className="w-fit rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
                >
                  Refresh
                </button>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-6">
                {/* 2. Today's schedule */}
                <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                  <h2
                    className="text-lg font-semibold text-slate-900"
                    style={{ fontFamily: "var(--font-dm-serif)" }}
                  >
                    Today&apos;s schedule
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">Your sessions for today.</p>

                  {todaySchedule.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                      No sessions today — enjoy your day!
                    </div>
                  ) : (
                    <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                      {todaySchedule.map((b) => (
                        <div key={b.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {b.parentName} · <span className="text-slate-600">{b.childName}</span>
                            </p>
                            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                              <span>{timeLabel(b.sessionDate)}</span>
                              <span className="text-slate-300">·</span>
                              <span>{b.durationMinutes != null ? `${b.durationMinutes} min` : "—"}</span>
                              <span className="text-slate-300">·</span>
                              <TypeIcon sessionType={b.sessionType} />
                            </p>
                          </div>
                          <StatusChip status={b.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* 3. Pending requests */}
                <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                  <h2
                    className="text-lg font-semibold text-slate-900"
                    style={{ fontFamily: "var(--font-dm-serif)" }}
                  >
                    Pending requests
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Accept or decline new booking requests.
                  </p>

                  {actionError ? (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {actionError}
                    </div>
                  ) : null}

                  {pending.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                      No pending requests right now.
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-3">
                      {pending.map((b) => (
                        <div key={b.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {b.parentName} · <span className="text-slate-600">{b.childName}</span>
                              </p>
                              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                                <span>{formatToday(b.sessionDate ? new Date(b.sessionDate) : new Date())}</span>
                                <span className="text-slate-300">·</span>
                                <span>{timeLabel(b.sessionDate)}</span>
                                <span className="text-slate-300">·</span>
                                <span>{b.durationMinutes != null ? `${b.durationMinutes} min` : "—"}</span>
                                <span className="text-slate-300">·</span>
                                <TypeIcon sessionType={b.sessionType} />
                              </p>
                              <p className="mt-1 text-sm text-slate-700">
                                Price:{" "}
                                <span className="font-semibold text-slate-900">
                                  {b.priceCents != null ? money(b.priceCents) : "—"}
                                </span>
                              </p>
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                disabled={isPendingAction}
                                onClick={() => updateBookingStatus(b.id, "confirmed")}
                                className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60"
                                style={{ backgroundColor: BRAND.primary }}
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                disabled={isPendingAction}
                                onClick={() => updateBookingStatus(b.id, "cancelled")}
                                className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Right column */}
              <aside className="lg:pt-1">
                <div className="sticky top-20 space-y-4">
                  {/* 4. Earnings */}
                  <section className="rounded-3xl border border-emerald-100/70 bg-white/90 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Earnings this month
                    </p>
                    <p
                      className="mt-2 text-3xl font-semibold tracking-tight text-slate-900"
                      style={{ fontFamily: "var(--font-dm-serif)" }}
                    >
                      {money(earnedThisMonthCents)} earned this month
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Platform fee (15%) has been deducted
                    </p>
                  </section>

                  {/* 5. Quick actions */}
                  <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Quick actions
                    </p>
                    <div className="mt-4 grid gap-2">
                      {[
                        { title: "Edit Profile", href: "/dashboard/therapist/profile" },
                        { title: "Set Availability", href: "/dashboard/therapist/availability" },
                        { title: "Write Session Note", href: "/dashboard/therapist/notes" },
                        { title: "View Messages", href: "/dashboard/therapist/messages" },
                      ].map((a) => (
                        <Link
                          key={a.title}
                          href={a.href}
                          className="rounded-2xl border border-emerald-100/70 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <span style={{ color: BRAND.primary }}>{a.title}</span>
                          <span className="ml-2 text-slate-400">→</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

