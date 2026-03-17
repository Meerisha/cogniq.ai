import Link from "next/link";

export default function LoginPage() {
  // TODO: Wire this up to Supabase auth (magic link / email + password or OAuth)
  return (
    <main className="flex min-h-screen items-center justify-center bg-sky-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-semibold text-sky-700">
          COGNIQA AI
        </h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          Log in to continue supporting your learner.
        </p>

        <div className="space-y-4">
          <button
            className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-medium text-white shadow hover:bg-sky-600"
            type="button"
          >
            Continue as Parent
          </button>
          <button
            className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white shadow hover:bg-emerald-600"
            type="button"
          >
            Continue as Therapist / Educator
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Access is invite-only for now.{" "}
          <Link href="#" className="font-medium text-sky-600 hover:underline">
            Request access
          </Link>
        </p>
      </div>
    </main>
  );
}

