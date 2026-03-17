import type { ReactNode } from "react";

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-sky-50">
      <header className="border-b border-sky-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-sky-500" />
            <div>
              <p className="text-sm font-semibold text-sky-700">COGNIQA AI Parent</p>
              <p className="text-xs text-slate-500">
                Preview mode – auth is not enforced yet.
              </p>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-4">{children}</main>
    </div>
  );
}

