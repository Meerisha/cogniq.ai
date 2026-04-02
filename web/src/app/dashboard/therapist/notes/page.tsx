"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const BRAND = {
  primary: "#2D6A4F",
  accent: "#F4A261",
  bg: "#FAFAF8",
};

type BookingRow = {
  id: string;
  child_id: string | null;
  session_date: string | null;
  duration_minutes: number | null;
  status: string | null;
};

type ChildRow = {
  id: string;
  name: string;
  therapy_goals: string[] | null;
};

function formatSessionLabel(args: {
  childName: string;
  sessionDate: string | null;
  durationMinutes: number | null;
}) {
  const dateLabel = (() => {
    if (!args.sessionDate) return "—";
    const d = new Date(args.sessionDate);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  })();

  const dur = args.durationMinutes != null ? `${args.durationMinutes} min` : "—";
  return `${args.childName} — ${dateLabel} — ${dur}`;
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M12 2l1.4 6.1L20 10l-6.6 1.9L12 18l-1.4-6.1L4 10l6.6-1.9L12 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 2.8l.6 2.4 2.4.6-2.4.6-.6 2.4-.6-2.4-2.4-.6 2.4-.6.6-2.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-.2-.2a2 2 0 0 0-2.8 0L5 17v3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 6.5 17.5 10.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function TherapistNotesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<
    { booking: BookingRow; child: ChildRow }[]
  >([]);

  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const selected = useMemo(
    () => sessions.find((s) => s.booking.id === selectedBookingId) ?? null,
    [sessions, selectedBookingId]
  );

  const [goalsChecked, setGoalsChecked] = useState<Record<string, boolean>>({});
  const goals = useMemo(() => selected?.child.therapy_goals ?? [], [selected]);

  const [progressNotes, setProgressNotes] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

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
        setError("Please sign in to write a session note.");
        setLoading(false);
        return;
      }

      // Completed bookings for this therapist
      const { data: bookingRows, error: bookingErr } = await supabase
        .from("bookings")
        .select("id, child_id, session_date, duration_minutes, status")
        .eq("therapist_id", user.id)
        .eq("status", "completed")
        .order("session_date", { ascending: false })
        .limit(50);

      if (!alive) return;
      if (bookingErr) {
        setError(bookingErr.message ?? "Unable to load sessions.");
        setLoading(false);
        return;
      }

      const bookings = (bookingRows ?? []) as any[];
      const bookingIds = bookings.map((b) => String(b.id));
      const childIds = Array.from(
        new Set(bookings.map((b) => b.child_id).filter(Boolean))
      ) as string[];

      // Exclude bookings that already have a session note
      let notedBookingIds = new Set<string>();
      if (bookingIds.length > 0) {
        const { data: notes } = await supabase
          .from("session_notes")
          .select("booking_id")
          .in("booking_id", bookingIds);
        if (notes) {
          notedBookingIds = new Set(
            (notes as any[]).map((n) => String(n.booking_id))
          );
        }
      }

      const remaining = bookings.filter((b) => !notedBookingIds.has(String(b.id)));

      // Load children details (name + therapy_goals)
      const { data: childRows, error: childErr } = await supabase
        .from("children")
        .select("id, name, therapy_goals")
        .in("id", childIds);

      if (!alive) return;
      if (childErr) {
        setError(childErr.message ?? "Unable to load child profiles.");
        setLoading(false);
        return;
      }

      const childMap = new Map<string, ChildRow>();
      for (const c of (childRows ?? []) as any[]) {
        childMap.set(String(c.id), {
          id: String(c.id),
          name: String(c.name ?? "Child"),
          therapy_goals: (c.therapy_goals ?? []) as string[] | null,
        });
      }

      const hydrated = remaining
        .map((b) => {
          const booking: BookingRow = {
            id: String(b.id),
            child_id: (b.child_id ?? null) as string | null,
            session_date: (b.session_date ?? null) as string | null,
            duration_minutes: (b.duration_minutes ?? null) as number | null,
            status: (b.status ?? null) as string | null,
          };
          const child = booking.child_id ? childMap.get(booking.child_id) : null;
          if (!child) return null;
          return { booking, child };
        })
        .filter(Boolean) as { booking: BookingRow; child: ChildRow }[];

      setSessions(hydrated);
      setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  // When selected session changes, reset goal checks and summaries
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const g of goals ?? []) next[g] = false;
    setGoalsChecked(next);
    setProgressNotes("");
    setGeneratedSummary(null);
    setAiSummary("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBookingId]);

  async function generateSummary() {
    if (!progressNotes.trim()) {
      showToast("Add a few lines of notes first.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/ai/summarize-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress_notes: progressNotes }),
      });
      const json = (await res.json().catch(() => null)) as any;
      if (!res.ok) {
        setError(json?.error ?? "Couldn’t generate a summary right now.");
        return;
      }
      const summary = String(json?.summary ?? "").trim();
      setGeneratedSummary(summary);
      setAiSummary(summary);
      showToast("Summary ready.");
    });
  }

  async function saveNote() {
    if (!selected) {
      showToast("Select a session first.");
      return;
    }
    if (!progressNotes.trim()) {
      showToast("Add progress notes first.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in again.");
        return;
      }

      const goalsAddressed = Object.entries(goalsChecked)
        .filter(([, v]) => v)
        .map(([k]) => k);

      const { error: insErr } = await supabase.from("session_notes").insert({
        booking_id: selected.booking.id,
        therapist_id: user.id,
        child_id: selected.child.id,
        goals_addressed: goalsAddressed,
        progress_notes: progressNotes,
        ai_summary: aiSummary,
      });

      if (insErr) {
        setError(insErr.message ?? "Could not save session note.");
        return;
      }

      showToast("Saved session note.");
      // Remove from dropdown list
      setSessions((prev) => prev.filter((s) => s.booking.id !== selected.booking.id));
      setSelectedBookingId("");
    });
  }

  return (
    <div style={{ backgroundColor: BRAND.bg }} className="min-h-[calc(100vh-56px)]">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-3xl border border-emerald-100/70 bg-white/90 p-6 shadow-sm">
          <h1
            className="text-3xl font-semibold tracking-tight text-slate-900"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            Write a session note
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Keep it simple and parent-friendly. You can generate a warm summary in one click.
          </p>

          {toast ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {toast}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-6 space-y-3">
              <div className="h-12 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
              <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
              <div className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* Session select */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-800">
                  Select a completed session
                </label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">Select…</option>
                  {sessions.map((s) => (
                    <option key={s.booking.id} value={s.booking.id}>
                      {formatSessionLabel({
                        childName: s.child.name,
                        sessionDate: s.booking.session_date,
                        durationMinutes: s.booking.duration_minutes,
                      })}
                    </option>
                  ))}
                </select>
                {sessions.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No completed sessions without notes yet.
                  </p>
                ) : null}
              </div>

              {/* Goals */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-800">Goals addressed</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(goals?.length ? goals : ["No goals listed yet"]).map((g) => (
                    <label
                      key={g}
                      className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-emerald-700"
                        checked={Boolean(goalsChecked[g])}
                        disabled={!selected || g === "No goals listed yet"}
                        onChange={(e) =>
                          setGoalsChecked((prev) => ({
                            ...prev,
                            [g]: e.target.checked,
                          }))
                        }
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              {/* Progress notes */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-800">Progress notes</label>
                <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  rows={4}
                  disabled={!selected}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50"
                  placeholder="Describe what happened in the session, how the child responded, any breakthroughs or challenges..."
                />
              </div>

              {/* AI Summary */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={generateSummary}
                  disabled={!selected || isPending}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition disabled:opacity-60"
                  style={{ backgroundColor: BRAND.accent }}
                >
                  <SparkleIcon />
                  {isPending ? "Generating…" : "Generate AI Summary"}
                </button>

                {generatedSummary ? (
                  <div className="rounded-3xl border border-emerald-100/70 bg-emerald-50/60 px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-emerald-950">
                        Parent-facing summary (editable)
                      </p>
                      <span className="text-emerald-800/80" title="Editable below">
                        <EditIcon />
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-800">
                      {generatedSummary}
                    </p>
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-800">AI summary</label>
                  <textarea
                    value={aiSummary}
                    onChange={(e) => setAiSummary(e.target.value)}
                    rows={3}
                    disabled={!selected}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50"
                    placeholder="A short, warm summary for the parent will appear here."
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={saveNote}
                  disabled={!selected || isPending}
                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60"
                  style={{ backgroundColor: BRAND.primary }}
                >
                  {isPending ? "Saving…" : "Save Session Note"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

