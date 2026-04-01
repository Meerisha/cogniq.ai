"use client";

import Link from "next/link";
import { useMemo } from "react";

export type TherapistCardProps = {
  id: string;
  name: string;
  avatar_url: string | null;
  specialties: string[];
  rating_avg: number;
  review_count: number;
  hourly_rate: number;
  session_types: string;
  location_city: string;
  location_state: string;
  is_verified: boolean;
};

const BRAND = {
  primary: "#2D6A4F",
  accent: "#F4A261",
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (`${first}${last}`.toUpperCase() || "?").slice(0, 2);
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      aria-hidden="true"
      fill={filled ? "#F4A261" : "none"}
    >
      <path
        d="M10 1.7l2.5 5.2 5.7.8-4.1 4 1 5.7L10 14.9 4.9 17.4l1-5.7-4.1-4 5.7-.8L10 1.7Z"
        stroke={filled ? "#F4A261" : "#CBD5E1"}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
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

function VerifiedBadge() {
  return (
    <div
      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-sm"
      style={{ backgroundColor: BRAND.primary }}
      title="Verified"
      aria-label="Verified"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path
          d="M20 7 10.5 17.2 4.5 12"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function sessionTypeLabel(session_types: string) {
  const s = (session_types || "").toLowerCase();
  if (s.includes("both")) return "Virtual + In-person";
  if (s.includes("virtual")) return "Virtual";
  if (s.includes("in-person") || s.includes("in person")) return "In-person";
  return session_types || "Session type";
}

export function TherapistCard(props: TherapistCardProps) {
  const initials = useMemo(() => initialsFromName(props.name), [props.name]);
  const filledStars = Math.max(0, Math.min(5, Math.floor(props.rating_avg || 0)));
  const location = [props.location_city, props.location_state].filter(Boolean).join(", ");
  const sessionType = (props.session_types || "").toLowerCase();

  return (
    <article className="group rounded-3xl border border-emerald-100/70 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="relative">
          {props.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={props.avatar_url}
              alt={props.name}
              className="h-14 w-14 rounded-2xl border border-slate-100 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-emerald-50 text-sm font-semibold text-emerald-800">
              {initials}
            </div>
          )}
          {props.is_verified ? (
            <div className="absolute -bottom-2 -right-2">
              <VerifiedBadge />
            </div>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-900">
                {props.name}
              </p>
              <p className="truncate text-sm text-slate-600">{location || "—"}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-slate-900">
              {Number.isFinite(props.hourly_rate) ? `$${Math.round(props.hourly_rate)}/hr` : "—"}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {(props.specialties ?? []).slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: BRAND.primary }}
              >
                {s}
              </span>
            ))}
            {(props.specialties ?? []).length > 4 ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                +{(props.specialties ?? []).length - 4}
              </span>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} filled={i < filledStars} />
                ))}
              </div>
              <span className="text-sm text-slate-600">
                {props.review_count} review{props.review_count === 1 ? "" : "s"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-slate-700">
              {sessionType.includes("both") ? (
                <>
                  <span className="text-slate-500">
                    <CameraIcon />
                  </span>
                  <span className="text-slate-400">+</span>
                  <span className="text-slate-500">
                    <PinIcon />
                  </span>
                </>
              ) : sessionType.includes("virtual") ? (
                <span className="text-slate-500">
                  <CameraIcon />
                </span>
              ) : (
                <span className="text-slate-500">
                  <PinIcon />
                </span>
              )}
              <span className="text-slate-700">{sessionTypeLabel(props.session_types)}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href={`/therapists/${props.id}`}
              className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
            >
              View Profile
            </Link>
            <Link
              href={`/book/${props.id}`}
              className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:opacity-95"
              style={{ backgroundColor: BRAND.accent }}
            >
              Book Session
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

