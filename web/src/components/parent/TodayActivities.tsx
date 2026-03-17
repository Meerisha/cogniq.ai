type Activity = {
  title: string;
  description: string;
};

type Props = {
  activities: Activity[] | null;
  isLoading: boolean;
};

export function TodayActivities({ activities, isLoading }: Props) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-sky-800">
        Today&apos;s Home Ideas
      </h2>
      <p className="text-xs text-slate-500">
        Simple, playful ideas to gently reinforce therapy goals at home.
      </p>
      <div className="mt-2 space-y-2">
        {isLoading && (
          <div className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-700">
            Thinking of ideas for today...
          </div>
        )}
        {!isLoading && activities && activities.length > 0 && (
          <ul className="space-y-2">
            {activities.map((activity, index) => (
              <li
                key={`${activity.title}-${index}`}
                className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs"
              >
                <p className="font-semibold text-sky-800">
                  {index + 1}. {activity.title}
                </p>
                <p className="mt-1 text-slate-700">{activity.description}</p>
              </li>
            ))}
          </ul>
        )}
        {!isLoading && (!activities || activities.length === 0) && (
          <p className="text-xs text-slate-500">
            Save today&apos;s check-in to see fresh ideas here.
          </p>
        )}
      </div>
    </section>
  );
}

