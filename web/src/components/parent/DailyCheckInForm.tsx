"use client";

import { useState, useTransition } from "react";

type MoodOption = {
  value: number;
  label: string;
  emoji: string;
};

const MOODS: MoodOption[] = [
  { value: 1, label: "Rough day", emoji: "😣" },
  { value: 2, label: "A bit hard", emoji: "😕" },
  { value: 3, label: "In between", emoji: "😐" },
  { value: 4, label: "Pretty good", emoji: "🙂" },
  { value: 5, label: "Great day", emoji: "😊" },
];

type Props = {
  onSubmitCheckIn: (payload: {
    mood_score: number;
    behaviors_observed: string;
    skills_practiced_at_home: string;
    notes: string;
  }) => Promise<{
    activities: {
      title: string;
      description: string;
    }[];
  }>;
  onActivitiesReceived?: (activities: {
    title: string;
    description: string;
  }[]) => void;
};

export function DailyCheckInForm({
  onSubmitCheckIn,
  onActivitiesReceived,
}: Props) {
  const [mood, setMood] = useState<number | null>(null);
  const [behaviors, setBehaviors] = useState("");
  const [skills, setSkills] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!mood) {
      setError("Tap how today felt to continue.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await onSubmitCheckIn({
          mood_score: mood,
          behaviors_observed: behaviors.trim(),
          skills_practiced_at_home: skills.trim(),
          notes: notes.trim(),
        });
        setMessage("Check-in saved. Thank you for sharing today.");
        setBehaviors("");
        setSkills("");
        setNotes("");
        if (onActivitiesReceived) {
          onActivitiesReceived(result.activities ?? []);
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong saving today. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-800">
          How did today feel overall?
        </p>
        <div className="flex justify-between gap-2">
          {MOODS.map((option) => {
            const isSelected = mood === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMood(option.value)}
                className={`flex flex-1 flex-col items-center rounded-2xl border px-2 py-2 text-xs shadow-sm transition ${
                  isSelected
                    ? "border-sky-500 bg-sky-50 text-sky-800"
                    : "border-sky-100 bg-white text-slate-600 hover:border-sky-200"
                }`}
              >
                <span className="text-xl">{option.emoji}</span>
                <span className="mt-1">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-800">
          What did you notice today?{" "}
          <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          value={behaviors}
          onChange={(e) => setBehaviors(e.target.value)}
          rows={3}
          placeholder="For example: more eye contact at breakfast, big feelings after school, calmer bedtime..."
          className="w-full rounded-2xl border border-sky-100 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-sky-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-800">
          Skills you practiced at home{" "}
          <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          rows={3}
          placeholder="For example: asking for help, turn-taking game, practicing new words..."
          className="w-full rounded-2xl border border-sky-100 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-sky-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-800">
          Anything else you want the care team to know?{" "}
          <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Share any wins, worries, or moments you want us to understand."
          className="w-full rounded-2xl border border-sky-100 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-sky-400"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" aria-live="polite">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-emerald-600" aria-live="polite">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Saving..." : "Save today’s check-in"}
      </button>
      <p className="text-center text-[11px] text-slate-500">
        This takes under 2 minutes and helps your child&apos;s whole team stay
        in sync.
      </p>
    </form>
  );
}

