import type { ReactNode } from "react";

export default function TherapistLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-emerald-50">
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                COGNIQA AI Therapist
              </p>
              <p className="text-xs text-slate-500">
                Preview mode – auth is not enforced yet.
              </p>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-4">{children}</main>
    </div>
  );
}

