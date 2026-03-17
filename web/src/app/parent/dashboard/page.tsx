"use client";

import { useState } from "react";
import { DailyCheckInForm } from "@/components/parent/DailyCheckInForm";
import { TodayActivities } from "@/components/parent/TodayActivities";
import { submitDailyCheckIn } from "./actions";

export default function ParentDashboardPage() {
  const [activities, setActivities] = useState<
    { title: string; description: string }[] | null
  >(null);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  async function handleSubmit(payload: {
    mood_score: number;
    behaviors_observed: string;
    skills_practiced_at_home: string;
    notes: string;
  }) {
    setIsLoadingActivities(true);
    try {
      const result = await submitDailyCheckIn(payload);
      setActivities(result.activities ?? []);
      return result;
    } finally {
      setIsLoadingActivities(false);
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold text-sky-800">
        Today&apos;s Check-In
      </h1>
      <p className="text-sm text-slate-600">
        Share a quick snapshot of today so your child&apos;s team can stay in
        sync. This should take under two minutes.
      </p>
      <div className="space-y-4 rounded-2xl border border-sky-100 bg-white p-4 text-sm text-slate-500">
        <DailyCheckInForm
          onSubmitCheckIn={handleSubmit}
          onActivitiesReceived={(items) => setActivities(items)}
        />
        <hr className="border-sky-50" />
        <TodayActivities
          activities={activities}
          isLoading={isLoadingActivities}
        />
      </div>
    </section>
  );
}

