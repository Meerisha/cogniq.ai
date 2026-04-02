"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const BRAND = {
  primary: "#2D6A4F",
  accent: "#F4A261",
  bg: "#FAFAF8",
};

type Booking = {
  id: string;
  therapist_id: string | null;
  session_date: string | null;
  duration_minutes: number | null;
  status: "pending" | "confirmed" | "completed" | "cancelled" | string | null;
};

type TherapistMini = { id: string; full_name: string | null };

function timeGreeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function statusStyles(status: string | null) {
  const s = (status ?? "").toLowerCase();
  if (s === "confirmed") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (s === "cancelled") return "bg-rose-50 text-rose-800 border-rose-200";
  if (s === "pending") return "bg-amber-50 text-amber-900 border-amber-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function LightbulbIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 2a7 7 0 0 0-4.3 12.6c.6.5 1.1 1.3 1.3 2.1l.1.3h5.8l.1-.3c.2-.8.7-1.6 1.3-2.1A7 7 0 0 0 12 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 21h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 18h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ParentDashboardNew() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [parentName, setParentName] = useState<string>("there");
  const [childName, setChildName] = useState<string>("your child");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [therapistsById, setTherapistsById] = useState<Map<string, TherapistMini>>(new Map());

  const [tip, setTip] = useState<string>("");
  const [tipLoading, setTipLoading] = useState(false);

  const greeting = useMemo(() => timeGreeting(), []);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);

      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (!alive) return;
      if (userErr || !user) {
        setError("Please sign in to view your dashboard.");
        setLoading(false);
        return;
      }

      // Parent name
      const { data: uRow } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!alive) return;
      const fullName = (uRow as { full_name?: string | null } | null)?.full_name ?? null;
      setParentName(fullName?.split(" ")[0] ?? "there");

      // Child name (first child)
      const { data: cRow } = await supabase
        .from("children")
        .select("name")
        .eq("parent_id", user.id)
        .order("name", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!alive) return;
      const cName = (cRow as { name?: string } | null)?.name ?? null;
      setChildName(cName ?? "your child");

      // Upcoming bookings (next 3)
      const nowIso = new Date().toISOString();
      const { data: bRows } = await supabase
        .from("bookings")
        .select("id, therapist_id, session_date, duration_minutes, status")
        .eq("parent_id", user.id)
        .gte("session_date", nowIso)
        .order("session_date", { ascending: true })
        .limit(3);

      if (!alive) return;

      const list = ((bRows ?? []) as any[]).map((b) => ({
        id: String(b.id),
        therapist_id: (b.therapist_id ?? null) as string | null,
        session_date: (b.session_date ?? null) as string | null,
        duration_minutes: (b.duration_minutes ?? null) as number | null,
        status: (b.status ?? null) as Booking["status"],
      })) as Booking[];

      setBookings(list);

      const therapistIds = Array.from(
        new Set(list.map((b) => b.therapist_id).filter(Boolean))
      ) as string[];

      if (therapistIds.length > 0) {
        const { data: tRows } = await supabase
          .from("users")
          .select("id, full_name")
          .in("id", therapistIds);
        if (!alive) return;
        const map = new Map<string, TherapistMini>();
        for (const t of (tRows ?? []) as any[]) {
          map.set(String(t.id), { id: String(t.id), full_name: t.full_name ?? null });
        }
        setTherapistsById(map);
      } else {
        setTherapistsById(new Map());
      }

      setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  async function refreshTip() {
    setTipLoading(true);
    try {
      const res = await fetch("/api/ai/daily-tip", { method: "GET" });
      const json = (await res.json().catch(() => null)) as any;
      if (!res.ok) {
        setTip(json?.error ?? "Couldn’t load a tip right now.");
        return;
      }
      setTip(String(json?.activity ?? "").trim());
    } finally {
      setTipLoading(false);
    }
  }

  useEffect(() => {
    refreshTip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ backgroundColor: BRAND.bg }} className="min-h-[calc(100vh-56px)]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            <div className="h-28 animate-pulse rounded-3xl border border-slate-200 bg-white/70" />
            <div className="h-48 animate-pulse rounded-3xl border border-slate-200 bg-white/70" />
            <div className="h-48 animate-pulse rounded-3xl border border-slate-200 bg-white/70" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Welcome header */}
            <section className="rounded-3xl border border-emerald-100/70 bg-white/90 p-6 shadow-sm">
              <h1
                className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
                style={{ fontFamily: "var(--font-dm-serif)" }}
              >
                {greeting}, {parentName}
              </h1>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Here&apos;s what&apos;s happening with{" "}
                <span className="font-semibold text-slate-800">{childName}</span>
                &apos;s care
              </p>
            </section>

            {/* 2. Upcoming bookings */}
            <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2
                    className="text-lg font-semibold text-slate-900"
                    style={{ fontFamily: "var(--font-dm-serif)" }}
                  >
                    Upcoming bookings
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Your next sessions, all in one place.
                  </p>
                </div>
                <Link
                  href="/dashboard/parent/bookings"
                  className="text-sm font-semibold underline decoration-emerald-200 underline-offset-4 hover:decoration-emerald-400"
                  style={{ color: BRAND.primary }}
                >
                  View all bookings
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                  No upcoming bookings yet. When you book a session, it will show up here.
                </div>
              ) : (
                <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                  {bookings.map((b) => {
                    const therapistName =
                      (b.therapist_id && therapistsById.get(b.therapist_id)?.full_name) ||
                      "Therapist";
                    return (
                      <div key={b.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {therapistName}
                          </p>
                          <p className="mt-0.5 text-sm text-slate-600">
                            {formatDateTime(b.session_date)} ·{" "}
                            {b.duration_minutes != null ? `${b.duration_minutes} min` : "—"}
                          </p>
                        </div>
                        <span
                          className={[
                            "inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold",
                            statusStyles(b.status),
                          ].join(" ")}
                        >
                          {(b.status ?? "pending").toString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 3. AI tip of the day */}
            <section className="rounded-3xl border border-emerald-100/70 bg-white/90 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: "rgba(45,106,79,0.10)", color: BRAND.primary }}
                  >
                    <LightbulbIcon />
                  </div>
                  <div>
                    <h2
                      className="text-lg font-semibold text-slate-900"
                      style={{ fontFamily: "var(--font-dm-serif)" }}
                    >
                      Today&apos;s Home Activity
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      One small idea you can try today.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={refreshTip}
                  disabled={tipLoading}
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition disabled:opacity-60"
                  style={{ backgroundColor: BRAND.accent }}
                >
                  {tipLoading ? "Refreshing…" : "Refresh tip"}
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-relaxed text-slate-700">
                {tip || "Loading a calm, helpful idea…"}
              </div>
            </section>

            {/* 5. Quick actions */}
            <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <h2
                className="text-lg font-semibold text-slate-900"
                style={{ fontFamily: "var(--font-dm-serif)" }}
              >
                Quick actions
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { title: "Find a Therapist", href: "/therapists", desc: "Browse verified specialists" },
                  { title: "My Children", href: "/dashboard/parent/children", desc: "Profiles, goals, and notes" },
                  { title: "Progress Reports", href: "/dashboard/parent/progress", desc: "See trends and milestones" },
                  { title: "Messages", href: "/dashboard/parent/messages", desc: "Stay in sync with care team" },
                ].map((c) => (
                  <Link
                    key={c.title}
                    href={c.href}
                    className="group rounded-2xl border border-emerald-100/70 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{c.desc}</p>
                    <p
                      className="mt-3 text-sm font-semibold"
                      style={{ color: BRAND.primary }}
                    >
                      Open →
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

