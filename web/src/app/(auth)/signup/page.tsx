"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Role = "parent" | "therapist";

const BRAND = {
  primary: "#2D6A4F",
  accent: "#F4A261",
  bg: "#FAFAF8",
};

const GOAL_OPTIONS = [
  "ABA Therapy",
  "Speech Therapy",
  "Occupational Therapy",
  "Feeding Therapy",
  "Behavioral Therapy",
] as const;

type GoalOption = (typeof GOAL_OPTIONS)[number];

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

function StepPill({ step, current }: { step: number; current: number }) {
  const active = step === current;
  const done = step < current;
  const bg = done ? "bg-emerald-600" : active ? "bg-emerald-500" : "bg-slate-200";
  return <span className={`h-2 w-10 rounded-full ${bg}`} />;
}

function FamilyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <path
        d="M8.2 10.1a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M16.7 9.8a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4.2 20c.2-3.4 2.3-5.2 4-5.8 1.7.6 3.8 2.4 4 5.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13.3 20c.1-2.6 1.7-4 3.1-4.5 1.4.5 3 1.9 3.1 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <path
        d="M12 11.2a3.4 3.4 0 1 0-3.4-3.4A3.4 3.4 0 0 0 12 11.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 20c.4-4 3.3-6.1 7-6.2 3.7.1 6.6 2.2 7 6.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Step 2
  const [role, setRole] = useState<Role | null>(null);

  // Step 3 Parent
  const [childName, setChildName] = useState("");
  const [dob, setDob] = useState<string>("");
  const [parentGoals, setParentGoals] = useState<Record<GoalOption, boolean>>({
    "ABA Therapy": false,
    "Speech Therapy": false,
    "Occupational Therapy": false,
    "Feeding Therapy": false,
    "Behavioral Therapy": false,
  });

  // Step 3 Therapist
  const [specialty, setSpecialty] = useState<GoalOption | "">("");
  const [yearsExperience, setYearsExperience] = useState<number | "">("");
  const [hourlyRate, setHourlyRate] = useState<number | "">("");
  const [sessionType, setSessionType] = useState<"virtual" | "in-person" | "both">(
    "virtual"
  );

  const selectedGoals = useMemo(() => {
    return GOAL_OPTIONS.filter((g) => parentGoals[g]);
  }, [parentGoals]);

  function canGoNext(): boolean {
    if (step === 1) return !!email && !!password && !!fullName;
    if (step === 2) return role != null;
    return true;
  }

  async function onSubmit() {
    if (!role) return;
    setError(null);

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (signUpError || !signUpData.user) {
        setError(signUpError?.message ?? "Unable to create your account.");
        return;
      }

      const userId = signUpData.user.id;

      const { error: userInsertError } = await supabase.from("users").insert({
        id: userId,
        email,
        full_name: fullName,
        role,
      });

      if (userInsertError) {
        setError(userInsertError.message ?? "Could not save your profile.");
        return;
      }

      if (role === "parent") {
        if (!childName) {
          setError("Please add your child's name.");
          return;
        }

        const { error: childError } = await supabase.from("children").insert({
          parent_id: userId,
          name: childName,
          date_of_birth: dob || null,
          therapy_goals: selectedGoals,
        });

        if (childError) {
          setError(childError.message ?? "Could not save your child's profile.");
          return;
        }

        router.push("/parent/dashboard");
        return;
      }

      // therapist
      if (!specialty) {
        setError("Please choose a specialty.");
        return;
      }

      const { error: therapistError } = await supabase.from("therapist_profiles").insert({
        user_id: userId,
        specialties: [specialty],
        years_experience:
          yearsExperience === "" ? null : Number(yearsExperience),
        hourly_rate: hourlyRate === "" ? null : Number(hourlyRate),
        session_types: sessionType,
        profile_complete: false,
      });

      if (therapistError) {
        setError(therapistError.message ?? "Could not save your therapist profile.");
        return;
      }

      router.push("/therapist/dashboard");
    });
  }

  return (
    <div
      className="min-h-[calc(100vh-56px)] px-4 py-10 sm:py-14"
      style={{ backgroundColor: BRAND.bg }}
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-3xl border border-emerald-100/70 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Heading>Create your account</Heading>
              <p className="text-sm text-slate-600">
                A warm, simple setup—so your support stays consistent.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <StepPill step={1} current={step} />
              <StepPill step={2} current={step} />
              <StepPill step={3} current={step} />
            </div>
          </div>

          <div className="mt-6">
            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Email
                  </label>
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      autoComplete="new-password"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                      placeholder="At least 6 characters"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Full name
                    </label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      type="text"
                      autoComplete="name"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                      placeholder="Your name"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-700">
                  Choose your role
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setRole("parent")}
                    className={[
                      "group rounded-2xl border bg-white px-5 py-5 text-left transition",
                      "hover:shadow-sm",
                      role === "parent"
                        ? "border-emerald-300 ring-4 ring-emerald-100"
                        : "border-slate-200",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: "rgba(45,106,79,0.10)",
                          color: BRAND.primary,
                        }}
                      >
                        <FamilyIcon />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-slate-900">
                          I’m a Parent
                        </p>
                        <p className="text-sm text-slate-600">
                          Find and book therapists for your child
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("therapist")}
                    className={[
                      "group rounded-2xl border bg-white px-5 py-5 text-left transition",
                      "hover:shadow-sm",
                      role === "therapist"
                        ? "border-emerald-300 ring-4 ring-emerald-100"
                        : "border-slate-200",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: "rgba(244,162,97,0.18)",
                          color: "#B45309",
                        }}
                      >
                        <PersonIcon />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-slate-900">
                          I’m a Therapist
                        </p>
                        <p className="text-sm text-slate-600">
                          List your services and manage bookings
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            ) : null}

            {step === 3 && role === "parent" ? (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Child’s name
                    </label>
                    <input
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      type="text"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                      placeholder="e.g., Maya"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Date of birth
                    </label>
                    <input
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      type="date"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    Therapy goals
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {GOAL_OPTIONS.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={parentGoals[opt]}
                          onChange={(e) =>
                            setParentGoals((prev) => ({
                              ...prev,
                              [opt]: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 accent-emerald-600"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {step === 3 && role === "therapist" ? (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Specialty
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value as GoalOption)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="">Select one</option>
                    {GOAL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Years of experience
                    </label>
                    <input
                      value={yearsExperience}
                      onChange={(e) =>
                        setYearsExperience(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      type="number"
                      min={0}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                      placeholder="e.g., 5"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Hourly rate
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                        $
                      </span>
                      <input
                        value={hourlyRate}
                        onChange={(e) =>
                          setHourlyRate(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        type="number"
                        min={0}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-8 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                        placeholder="e.g., 85"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Session type</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { id: "virtual", label: "Virtual" },
                      { id: "in-person", label: "In-person" },
                      { id: "both", label: "Both" },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={[
                          "flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-sm transition",
                          sessionType === (opt.id as any)
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-slate-200 bg-white",
                        ].join(" ")}
                      >
                        <span className="text-slate-700">{opt.label}</span>
                        <input
                          type="radio"
                          name="sessionType"
                          value={opt.id}
                          checked={sessionType === (opt.id as any)}
                          onChange={() => setSessionType(opt.id as any)}
                          className="h-4 w-4 accent-emerald-600"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  disabled={isPending}
                >
                  Back
                </button>
              ) : null}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
                  disabled={!canGoNext() || isPending}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60"
                  style={{ backgroundColor: BRAND.primary }}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isPending}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60"
                  style={{ backgroundColor: BRAND.primary }}
                >
                  {isPending ? "Creating…" : "Create account"}
                </button>
              )}
            </div>

            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold underline decoration-emerald-200 underline-offset-4 hover:decoration-emerald-400"
                style={{ color: BRAND.primary }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

