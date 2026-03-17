"use client";

import Link from "next/link";
import { useState } from "react";

const SECTIONS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#for-clinics", label: "For Clinics" },
  { href: "#about", label: "About" },
  { href: "/login", label: "Login" },
];

export function MainNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wide text-slate-900">
            COGNIQA AI
          </span>
        </Link>

        <div className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          {SECTIONS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-600"
          >
            Get Early Access
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-100 bg-white text-slate-700 shadow-sm md:hidden"
          aria-label="Toggle navigation"
        >
          <span className="block h-0.5 w-4 rounded-full bg-slate-700" />
          <span className="mt-0.5 block h-0.5 w-4 rounded-full bg-slate-700" />
        </button>
      </nav>

      {open && (
        <div className="border-t border-sky-100 bg-white/95 px-4 py-3 text-sm text-slate-700 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3">
            {SECTIONS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-1"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="mt-1 inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-600"
              onClick={() => setOpen(false)}
            >
              Get Early Access
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

