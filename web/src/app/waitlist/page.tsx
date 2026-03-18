"use client";

import { useState, useTransition } from "react";
import { joinWaitlist } from "./actions";

const ROLES = [
  { value: "parent", label: "Parent / caregiver" },
  { value: "clinic", label: "Clinic / therapy center" },
  { value: "school", label: "School / educator" },
];

export default function WaitlistPage() {
  const [role, setRole] = useState<string>("parent");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("role", role);

    startTransition(async () => {
      try {
        await joinWaitlist(formData);
        setMessage(
          "You’re in. We’ll email you as soon as your segment opens up."
        );
        (event.currentTarget as HTMLFormElement).reset();
        setRole("parent");
      } catch (err: any) {
        setError(err?.message ?? "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center px-4 py-10 text-left">
      <div className="w-full rounded-3xl border border-sky-100 bg-white/90 p-6 shadow-sm shadow-sky-50">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
          Early access
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Join the COGNIQA AI waitlist
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Tell us who you are so we can invite parents and clinics in the right
          order. It takes less than a minute.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="text-xs font-medium uppercase tracking-wide text-slate-700"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-sky-400"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-wide text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-sky-400"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-700">
              I&apos;m joining as
            </p>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((option) => {
                const selected = role === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      selected
                        ? "bg-sky-500 text-white shadow-sm shadow-sky-200"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-sky-300"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600" aria-live="polite">
              {error}
            </p>
          )}
          {message && (
            <p className="text-xs text-emerald-600" aria-live="polite">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-75"
          >
            {isPending ? "Joining waitlist..." : "Join the waitlist"}
          </button>
          <p className="mt-2 text-[11px] text-slate-500">
            We segment families and clinics separately so that each group gets
            the right onboarding experience.
          </p>
        </form>
      </div>
    </main>
  );
}

