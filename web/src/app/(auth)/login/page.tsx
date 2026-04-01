"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type DbUser = {
  id: string;
  role: "parent" | "therapist" | "admin" | null;
};

const BRAND = {
  primary: "#2D6A4F",
  accent: "#F4A261",
  bg: "#FAFAF8",
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data.user) {
        setError(signInError?.message ?? "Unable to sign in. Please try again.");
        return;
      }

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("id, role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (userError || !userRow) {
        setError("Signed in, but we couldn't load your profile yet.");
        return;
      }

      const role = (userRow as DbUser).role;
      if (role === "therapist") router.push("/therapist/dashboard");
      else router.push("/parent/dashboard");
    });
  }

  return (
    <div
      className="min-h-[calc(100vh-56px)] px-4 py-10 sm:py-14"
      style={{ backgroundColor: BRAND.bg }}
    >
      <div className="mx-auto w-full max-w-lg">
        <div className="rounded-3xl border border-emerald-100/70 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="space-y-2">
            <Heading>Welcome back</Heading>
            <p className="text-sm text-slate-600">
              Sign in to see updates, goals, and sessions in one calm place.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60"
              style={{ backgroundColor: BRAND.primary }}
            >
              {isPending ? "Signing in…" : "Sign in"}
              <span
                className="h-2 w-2 rounded-full opacity-80"
                style={{ backgroundColor: BRAND.accent }}
              />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            New here?{" "}
            <Link
              href="/signup"
              className="font-semibold underline decoration-emerald-200 underline-offset-4 hover:decoration-emerald-400"
              style={{ color: BRAND.primary }}
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

