"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const BRAND = {
  primary: "#2D6A4F",
  accent: "#F4A261",
  bg: "#FAFAF8",
};

type TherapistProfileRow = {
  id: string;
  user_id: string;
  bio: string | null;
  credentials: string | null;
  specialties: string[] | null;
  years_experience: number | null;
  hourly_rate: number | null;
  session_types: string | null;
  languages: string[] | null;
  is_verified: boolean | null;
  rating_avg: number | null;
  review_count: number | null;
  location_city: string | null;
  location_state: string | null;
  users?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

type ReviewRow = {
  id: string;
  parent_id: string | null;
  rating: number | null;
  body: string | null;
  created_at: string;
};

type ReviewView = {
  id: string;
  reviewerName: string;
  rating: number;
  createdAt: string;
  body: string;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (`${first}${last}`.toUpperCase() || "?").slice(0, 2);
}

function formatLocation(city: string | null, state: string | null) {
  return [city, state].filter(Boolean).join(", ");
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true" fill="none">
      <path
        d="M10 1.7l2.5 5.2 5.7.8-4.1 4 1 5.7L10 14.9 4.9 17.4l1-5.7-4.1-4 5.7-.8L10 1.7Z"
        fill={filled ? BRAND.accent : "transparent"}
        stroke={filled ? BRAND.accent : "#CBD5E1"}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RatingRow({
  ratingAvg,
  reviewCount,
}: {
  ratingAvg: number;
  reviewCount: number;
}) {
  const filled = Math.max(0, Math.min(5, Math.floor(ratingAvg || 0)));
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} filled={i < filled} />
        ))}
      </div>
      <span className="text-sm text-slate-700">
        <span className="font-semibold text-slate-900">
          {Math.round((ratingAvg || 0) * 10) / 10}
        </span>
        <span className="text-slate-400"> · </span>
        {reviewCount} review{reviewCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}

function VerifiedPill() {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900"
      title="Verified"
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: BRAND.primary }}
      />
      Verified
    </span>
  );
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

function sessionTypeParts(session_types: string | null) {
  const s = (session_types ?? "").toLowerCase();
  const hasVirtual = s.includes("virtual") || s.includes("both");
  const hasInPerson = s.includes("in-person") || s.includes("in person") || s.includes("both");
  return { hasVirtual, hasInPerson };
}

function SpecialtyDescriptions({ items }: { items: string[] }) {
  const desc = (s: string) => {
    const key = s.toLowerCase();
    if (key.includes("aba")) return "Structured, step-by-step coaching that builds daily skills gently.";
    if (key.includes("speech")) return "Play-based communication support—sounds, words, and connection.";
    if (key.includes("occupational")) return "Everyday routines, sensory needs, and confidence in movement.";
    if (key.includes("feeding")) return "A calm approach to food routines, textures, and mealtime comfort.";
    if (key.includes("behavior")) return "Support for big feelings with clear routines and steady reinforcement.";
    return "A supportive plan tailored to your child and your family rhythm.";
  };

  return (
    <div className="space-y-3">
      {items.map((s) => (
        <div key={s} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">{s}</p>
          <p className="mt-1 text-sm text-slate-600">{desc(s)}</p>
        </div>
      ))}
    </div>
  );
}

function BookingModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-3xl border border-emerald-100/70 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="text-xl font-semibold text-slate-900"
              style={{ fontFamily: "var(--font-dm-serif)" }}
            >
              Book a session
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Placeholder for now. We’ll build the full booking flow next.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          Booking modal content will go here.
        </div>
      </div>
    </div>
  );
}

type PageProps = {
  params: { id: string };
};

export default function TherapistProfilePage({ params }: PageProps) {
  const router = useRouter();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<TherapistProfileRow | null>(null);
  const [reviews, setReviews] = useState<ReviewView[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);

      const supabase = createSupabaseBrowserClient();

      const { data: p, error: pErr } = await supabase
        .from("therapist_profiles")
        .select(
          "id, user_id, bio, credentials, specialties, years_experience, hourly_rate, session_types, languages, is_verified, rating_avg, review_count, location_city, location_state, users(full_name, avatar_url)"
        )
        .eq("id", id)
        .maybeSingle();

      if (!alive) return;

      if (pErr) {
        setError(pErr.message ?? "Unable to load this therapist right now.");
        setProfile(null);
        setReviews([]);
        setLoading(false);
        return;
      }

      if (!p) {
        setProfile(null);
        setReviews([]);
        setLoading(false);
        return;
      }

      setProfile(p as TherapistProfileRow);

      const { data: r, error: rErr } = await supabase
        .from("reviews")
        .select("id, parent_id, rating, body, created_at")
        .eq("therapist_id", (p as TherapistProfileRow).user_id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!alive) return;

      if (rErr) {
        setReviews([]);
        setLoading(false);
        return;
      }

      const rows = (r ?? []) as ReviewRow[];
      const parentIds = Array.from(
        new Set(rows.map((x) => x.parent_id).filter(Boolean))
      ) as string[];

      let nameById = new Map<string, string>();
      if (parentIds.length > 0) {
        const { data: users } = await supabase
          .from("users")
          .select("id, full_name")
          .in("id", parentIds);
        if (users) {
          const ur = users as { id: string; full_name: string | null }[];
          nameById = new Map(ur.map((u) => [u.id, u.full_name ?? "Parent"]));
        }
      }

      const view: ReviewView[] = rows.map((x) => ({
        id: x.id,
        reviewerName: (x.parent_id && nameById.get(x.parent_id)) || "Parent",
        rating: Math.max(1, Math.min(5, Number(x.rating ?? 5))),
        createdAt: x.created_at,
        body: (x.body ?? "").trim(),
      }));

      setReviews(view);
      setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, [id]);

  const displayName = profile?.users?.full_name ?? "Therapist";
  const initials = useMemo(() => initialsFromName(displayName), [displayName]);
  const location = formatLocation(profile?.location_city ?? null, profile?.location_state ?? null);
  const specialties = (profile?.specialties ?? []).filter(Boolean);
  const languages = (profile?.languages ?? []).filter(Boolean);

  const ratingAvg = Number(profile?.rating_avg ?? 0);
  const reviewCount = Number(profile?.review_count ?? reviews.length ?? 0);
  const hourly = Number(profile?.hourly_rate ?? 0);
  const sessionParts = sessionTypeParts(profile?.session_types ?? null);

  if (!loading && !error && profile === null) {
    notFound();
  }

  return (
    <div style={{ backgroundColor: BRAND.bg }} className="min-h-[calc(100vh-56px)]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="h-40 animate-pulse rounded-3xl border border-slate-200 bg-white/70" />
              <div className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-white/70" />
              <div className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-white/70" />
            </div>
            <div className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white/70" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Left */}
            <div className="space-y-6">
              {/* Hero */}
              <section className="rounded-3xl border border-emerald-100/70 bg-white/90 p-6 shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {profile?.users?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profile.users.avatar_url}
                          alt={displayName}
                          className="h-20 w-20 rounded-3xl border border-slate-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-100 bg-emerald-50 text-lg font-semibold text-emerald-800">
                          {initials}
                        </div>
                      )}
                      {profile?.is_verified ? (
                        <div className="absolute -bottom-2 -right-2">
                          <span
                            className="inline-flex items-center justify-center rounded-full border-2 border-white px-2 py-1 text-xs font-semibold text-white shadow-sm"
                            style={{ backgroundColor: BRAND.primary }}
                          >
                            ✓
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1
                          className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
                          style={{ fontFamily: "var(--font-dm-serif)" }}
                        >
                          {displayName}
                        </h1>
                        {profile?.is_verified ? <VerifiedPill /> : null}
                      </div>

                      <p className="mt-1 text-sm text-slate-600">
                        {location || "Location shared after booking, if needed"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {specialties.slice(0, 5).map((s) => (
                          <span
                            key={s}
                            className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                            style={{ backgroundColor: BRAND.primary }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4">
                        <RatingRow ratingAvg={ratingAvg} reviewCount={reviewCount} />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* About */}
              <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                <h2
                  className="text-lg font-semibold text-slate-900"
                  style={{ fontFamily: "var(--font-dm-serif)" }}
                >
                  About
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {(profile?.bio ?? "").trim() ||
                    "A calm, supportive approach focused on real-life routines and steady progress."}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Languages
                    </p>
                    <p className="mt-1 text-sm text-slate-800">
                      {languages.length > 0 ? languages.join(", ") : "English"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Experience
                    </p>
                    <p className="mt-1 text-sm text-slate-800">
                      {profile?.years_experience != null
                        ? `${profile.years_experience}+ years`
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Credentials
                    </p>
                    <p className="mt-1 text-sm text-slate-800">
                      {(profile?.credentials ?? "").trim() || "Shared during onboarding"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Specialties & approach */}
              <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                <h2
                  className="text-lg font-semibold text-slate-900"
                  style={{ fontFamily: "var(--font-dm-serif)" }}
                >
                  Specialties & approach
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  What you can expect from sessions—clear steps, steady encouragement, and practical routines.
                </p>
                <div className="mt-4">
                  <SpecialtyDescriptions
                    items={specialties.length > 0 ? specialties : ["Support sessions"]}
                  />
                </div>
              </section>

              {/* Reviews */}
              <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2
                    className="text-lg font-semibold text-slate-900"
                    style={{ fontFamily: "var(--font-dm-serif)" }}
                  >
                    Reviews
                  </h2>
                  <div className="text-sm text-slate-600">
                    {reviewCount} total
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                    No reviews yet. Early families will see reviews appear here as sessions are completed.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {reviews.map((r) => (
                      <article
                        key={r.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {r.reviewerName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(r.createdAt)}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} filled={i < r.rating} />
                          ))}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                          {r.body || "—"}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right sticky */}
            <aside className="lg:pt-1">
              <div className="sticky top-20 space-y-4">
                <div className="rounded-3xl border border-emerald-100/70 bg-white/90 p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Hourly rate
                  </p>
                  <p
                    className="mt-2 text-3xl font-semibold tracking-tight text-slate-900"
                    style={{ fontFamily: "var(--font-dm-serif)" }}
                  >
                    {Number.isFinite(hourly) && hourly > 0 ? `$${Math.round(hourly)}` : "—"}
                    <span className="text-base font-normal text-slate-500">/hr</span>
                  </p>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Session types
                    </p>
                    <div className="mt-2 space-y-2 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className={sessionParts.hasVirtual ? "text-slate-700" : "text-slate-300"}>
                          <CameraIcon />
                        </span>
                        <span className={sessionParts.hasVirtual ? "text-slate-700" : "text-slate-400"}>
                          Virtual
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={sessionParts.hasInPerson ? "text-slate-700" : "text-slate-300"}>
                          <PinIcon />
                        </span>
                        <span className={sessionParts.hasInPerson ? "text-slate-700" : "text-slate-400"}>
                          In-person
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      type="button"
                      onClick={() => setBookingOpen(true)}
                      className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:opacity-95"
                      style={{ backgroundColor: BRAND.accent }}
                    >
                      Book a Session
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/messages")}
                      className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
                    >
                      Message Therapist
                    </button>
                  </div>

                  <div className="mt-5 space-y-2">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                      <p className="font-semibold">Verified Credentials</p>
                      <p className="mt-0.5 text-xs text-emerald-800/80">
                        A quick, human review—so you can book with confidence.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      <p className="font-semibold">Secure Payments via Stripe</p>
                      <p className="mt-0.5 text-xs text-amber-800/80">
                        Payments stay protected and simple.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}

