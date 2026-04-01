"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { TherapistCard, type TherapistCardProps } from "@/components/TherapistCard";

const BRAND = {
  primary: "#2D6A4F",
  accent: "#F4A261",
  bg: "#FAFAF8",
};

const SPECIALTIES = [
  "ABA Therapy",
  "Speech Therapy",
  "Occupational Therapy",
  "Feeding Therapy",
  "Behavioral Therapy",
] as const;

type Specialty = (typeof SPECIALTIES)[number];
type SessionFilter = "virtual" | "in-person";

type TherapistRow = {
  id: string;
  user_id: string;
  specialties: string[] | null;
  rating_avg: number | null;
  review_count: number | null;
  hourly_rate: number | null;
  session_types: string | null;
  location_city: string | null;
  location_state: string | null;
  is_verified: boolean | null;
  users?: { full_name: string | null; avatar_url: string | null } | null;
};

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="text-3xl tracking-tight text-slate-900 sm:text-4xl"
      style={{ fontFamily: "var(--font-dm-serif)" }}
    >
      {children}
    </h1>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-emerald-700"
      />
      {label}
    </label>
  );
}

function StarButton({
  value,
  active,
  onClick,
}: {
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-semibold transition",
        active ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
      aria-pressed={active}
    >
      <span className="text-[13px]" style={{ color: BRAND.accent }}>
        ★
      </span>
      {value}+
    </button>
  );
}

export default function TherapistsPage() {
  const [all, setAll] = useState<TherapistCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters
  const [specialties, setSpecialties] = useState<Record<Specialty, boolean>>({
    "ABA Therapy": false,
    "Speech Therapy": false,
    "Occupational Therapy": false,
    "Feeding Therapy": false,
    "Behavioral Therapy": false,
  });
  const [session, setSession] = useState<Record<SessionFilter, boolean>>({
    virtual: false,
    "in-person": false,
  });
  const [priceMax, setPriceMax] = useState(300);
  const [minRating, setMinRating] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setLoadError(null);

      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("therapist_profiles")
        .select(
          "id, user_id, specialties, rating_avg, review_count, hourly_rate, session_types, location_city, location_state, is_verified, users(full_name, avatar_url)"
        )
        .eq("is_verified", true)
        .order("rating_avg", { ascending: false });

      if (!alive) return;

      if (error) {
        setLoadError(error.message ?? "Unable to load therapists right now.");
        setAll([]);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as TherapistRow[];
      const mapped: TherapistCardProps[] = rows.map((r) => ({
        id: r.id,
        name: r.users?.full_name ?? "Therapist",
        avatar_url: r.users?.avatar_url ?? null,
        specialties: r.specialties ?? [],
        rating_avg: Number(r.rating_avg ?? 0),
        review_count: Number(r.review_count ?? 0),
        hourly_rate: Number(r.hourly_rate ?? 0),
        session_types: r.session_types ?? "virtual",
        location_city: r.location_city ?? "",
        location_state: r.location_state ?? "",
        is_verified: Boolean(r.is_verified),
      }));

      setAll(mapped);
      setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const activeSpecialties = useMemo(
    () => SPECIALTIES.filter((s) => specialties[s]),
    [specialties]
  );

  const filtered = useMemo(() => {
    return all.filter((t) => {
      // Specialty
      if (activeSpecialties.length > 0) {
        const set = new Set((t.specialties ?? []).map((s) => s.toLowerCase()));
        const ok = activeSpecialties.some((s) => set.has(s.toLowerCase()));
        if (!ok) return false;
      }

      // Session type
      const wantsVirtual = session.virtual;
      const wantsInPerson = session["in-person"];
      if (wantsVirtual || wantsInPerson) {
        const st = (t.session_types || "").toLowerCase();
        const hasVirtual = st.includes("virtual") || st.includes("both");
        const hasInPerson = st.includes("in-person") || st.includes("in person") || st.includes("both");
        if (wantsVirtual && !hasVirtual) return false;
        if (wantsInPerson && !hasInPerson) return false;
      }

      // Price
      if (Number.isFinite(t.hourly_rate) && t.hourly_rate > priceMax) return false;

      // Rating
      if (minRating != null && (t.rating_avg ?? 0) < minRating) return false;

      return true;
    });
  }, [all, activeSpecialties, session, priceMax, minRating]);

  function clearFilters() {
    setSpecialties({
      "ABA Therapy": false,
      "Speech Therapy": false,
      "Occupational Therapy": false,
      "Feeding Therapy": false,
      "Behavioral Therapy": false,
    });
    setSession({ virtual: false, "in-person": false });
    setPriceMax(300);
    setMinRating(null);
  }

  return (
    <div style={{ backgroundColor: BRAND.bg }} className="min-h-[calc(100vh-56px)]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden w-[280px] shrink-0 lg:block">
            <div className="sticky top-20 rounded-3xl border border-emerald-100/70 bg-white/90 p-5 shadow-sm">
              <h2
                className="text-lg font-semibold text-slate-900"
                style={{ fontFamily: "var(--font-dm-serif)" }}
              >
                Filter Therapists
              </h2>

              <div className="mt-5 space-y-5">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-800">Specialty</p>
                  <div className="space-y-2">
                    {SPECIALTIES.map((s) => (
                      <Checkbox
                        key={s}
                        label={s}
                        checked={specialties[s]}
                        onChange={(next) =>
                          setSpecialties((prev) => ({ ...prev, [s]: next }))
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-800">Session type</p>
                  <div className="space-y-2">
                    <Checkbox
                      label="Virtual"
                      checked={session.virtual}
                      onChange={(next) => setSession((p) => ({ ...p, virtual: next }))}
                    />
                    <Checkbox
                      label="In-person"
                      checked={session["in-person"]}
                      onChange={(next) =>
                        setSession((p) => ({ ...p, "in-person": next }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-800">Price range</p>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>$0/hr</span>
                      <span className="font-semibold text-slate-900">${priceMax}/hr</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={300}
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="mt-3 w-full accent-emerald-700"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-800">Minimum rating</p>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <StarButton
                        key={v}
                        value={v}
                        active={minRating === v}
                        onClick={() => setMinRating((cur) => (cur === v ? null : v))}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-semibold underline decoration-emerald-200 underline-offset-4 hover:decoration-emerald-400"
                  style={{ color: BRAND.primary }}
                >
                  Clear filters
                </button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="min-w-0 flex-1">
            <div className="flex flex-col gap-2">
              <Heading>Find a Therapist</Heading>
              <p className="text-sm text-slate-600 sm:text-base">
                Verified specialists for your child&apos;s needs
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">{filtered.length}</span>{" "}
                therapist{filtered.length === 1 ? "" : "s"} found
              </p>

              {/* Mobile quick clear */}
              <button
                type="button"
                onClick={clearFilters}
                className="lg:hidden rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-800"
              >
                Clear filters
              </button>
            </div>

            {loading ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[220px] animate-pulse rounded-3xl border border-slate-200 bg-white/70"
                  />
                ))}
              </div>
            ) : loadError ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                {loadError}
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-emerald-100/70 bg-white/90 px-6 py-10 text-center shadow-sm">
                <p
                  className="text-xl font-semibold text-slate-900"
                  style={{ fontFamily: "var(--font-dm-serif)" }}
                >
                  No matches right now
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Try widening your filters—more therapists will show up as we verify new profiles.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((t) => (
                  <TherapistCard key={t.id} {...t} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

