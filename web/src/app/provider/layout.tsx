import type { ReactNode } from "react";

export default function ProviderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-emerald-50/80">
      <header className="border-b border-emerald-100/90 bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-500/90" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                COGNIQA AI · Provider
              </p>
              <p className="text-xs text-slate-500">
                Preview mode – auth is not enforced yet.
              </p>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
