interface TherapistChildPageProps {
  params: {
    id: string;
  };
}

export default function TherapistChildPage({ params }: TherapistChildPageProps) {
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold text-emerald-800">
        Child Profile: {params.id}
      </h1>
      <p className="text-sm text-slate-600">
        Unified profile placeholder for this child (sessions, goals, parent
        check-ins, and classroom observations).
      </p>
      <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm text-slate-500">
        Unified child profile content will go here.
      </div>
    </section>
  );
}

