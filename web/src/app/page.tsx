import Link from "next/link";
import Image from "next/image";
import { FaqSection } from "@/components/FaqSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:px-8 md:py-[60px]">
        {/* Hero */}
        <section
          id="top"
          className="flex flex-col items-center gap-6 pb-0 pt-2 text-center md:pt-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1 text-xs font-semibold text-sky-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Built for ASD families &amp; care teams
          </div>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-slate-900 md:text-5xl">
            Find the right therapist.
            <br />
            Track every session.
            <br />
            All in one place.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            COGNIQA AI connects ASD families with verified therapists — book
            sessions, log daily check-ins, and get AI-generated home activities
            matched to real therapy goals.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 text-sm md:flex-row">
            <Link
              href="/parent/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:bg-sky-600"
            >
              I&apos;m a parent
            </Link>
            <Link
              href="/therapist/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-emerald-300 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
            >
              I run a clinic or center
            </Link>
          </div>
          <div className="space-y-1 text-xs text-slate-500">
            <p>Therapy works better when you&apos;re in the loop.</p>
            <p className="mt-1 text-[11px] font-medium text-slate-600">
              <span className="mr-1 align-middle text-amber-400">★★★★★</span>
              Trusted by 50+ ASD families in early access.
            </p>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-sky-100 to-transparent" />

        {/* Value props */}
        <section id="how-it-works" className="-mt-6 mb-7 grid gap-6 md:grid-cols-3">
          <div className="flex h-full flex-col rounded-2xl border border-sky-100 border-l-4 border-l-[#2563EB] bg-white p-5 text-sm shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-sky-100">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#DBEAFE]" aria-hidden>
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 22 Q 20 6 32 22 L32 34 L8 34 Z" />
                <path d="M26 22 L26 12 L32 8 L32 22" />
                <path d="M14 34 L14 24 L26 24 L26 34" />
                <path d="M20 28 C 20 25 18 22 16 23 C 14 24 14 27 16 29 C 18 31 20 31 20 31 C 20 31 22 31 24 29 C 26 27 26 24 24 23 C 22 22 20 25 20 28 Z" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
              For parents
            </p>
            <p className="mt-2 flex-1 text-slate-800">
              See your child&apos;s growth in warm, clear language—no reports to
              decode, just simple timelines and tiny daily wins.
            </p>
          </div>
          <div className="flex h-full flex-col rounded-2xl border border-emerald-100 border-l-4 border-l-emerald-600 bg-white p-5 text-sm shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-100">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100" aria-hidden>
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 34 L8 18 Q 8 14 12 14 L14 14 L14 8 Q 14 6 16 6 L24 6 Q 26 6 26 8 L26 14 L28 14 Q 32 14 32 18 L32 34 L8 34 Z" />
                <path d="M12 22 L12 28 M16 22 L16 28 M20 22 L20 28 M24 22 L24 28" />
                <path d="M18 10 L22 10 M20 8 L20 12" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              For clinics & centers
            </p>
            <p className="mt-2 flex-1 text-slate-800">
              A unified view across ABA, speech, OT, and school data so your
              team can spot trends early and adjust goals together.
            </p>
          </div>
          <div className="flex h-full flex-col rounded-2xl border border-violet-100 border-l-4 border-l-violet-600 bg-white p-5 text-sm shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-100">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100" aria-hidden>
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 L21 14 L20 16 L19 14 Z" />
                <path d="M20 34 L19 26 L20 24 L21 26 Z" />
                <path d="M6 20 L14 19 L16 20 L14 21 Z" />
                <path d="M34 20 L26 21 L24 20 L26 19 Z" />
                <path d="M10 10 L15 15 L14 16 L9 11 Z" />
                <path d="M30 10 L25 15 L26 16 L31 11 Z" />
                <path d="M10 30 L15 25 L16 26 L11 31 Z" />
                <path d="M30 30 L25 25 L24 26 L29 31 Z" />
                <circle cx="20" cy="20" r="3" strokeWidth="2" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
              Meet Niqa, your AI guide
            </p>
            <p className="mt-2 flex-1 text-slate-800">
              Niqa reads your child&apos;s goals and recent check‑ins, then turns
              them into simple ideas you can try at home—always with your care
              team in the loop.
            </p>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-100 to-transparent" />

        {/* How it works */}
        <section className="space-y-6">
          <h2 className="text-center text-xl font-semibold text-slate-900 md:text-2xl">
            How COGNIQA AI fits into real life
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 text-sm shadow-sm shadow-sky-50">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                1 · Daily check‑in
              </p>
              <p className="mt-2 text-slate-800">
                Parents spend under two minutes tapping mood, noting any big
                wins or tough moments, and logging skills practiced at home.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-sm shadow-sm shadow-emerald-50">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                2 · Unified view
              </p>
              <p className="mt-2 text-slate-800">
                COGNIQA AI blends home check‑ins with ABA, speech, OT, and school
                notes so every provider sees the same story.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-sm shadow-sm shadow-slate-50">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                3 · Niqa suggests the next tiny step
              </p>
              <p className="mt-2 text-slate-800">
                Niqa looks at what&apos;s happening in therapy and at home, then
                offers a few small next steps—like a game, a script, or a routine
                tweak. Your clinicians stay in charge of goals and adjustments.
              </p>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

        {/* For parents vs centers */}
        <section
          id="for-clinics"
          className="grid gap-5 md:grid-cols-2 md:items-stretch"
        >
          <div className="flex h-full flex-col rounded-[20px] border border-sky-100 border-l-4 border-l-[#2563EB] bg-[#F0F9FF] p-8">
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DBEAFE]"
              aria-hidden
            >
              <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 22 Q 20 6 32 22 L32 34 L8 34 Z" />
                <path d="M26 22 L26 12 L32 8 L32 22" />
                <path d="M14 34 L14 24 L26 24 L26 34" />
                <path d="M13 23 Q 12 18 10 17 Q 8 16 7 17.5" />
                <path d="M18 23 Q 19 18 21 17 Q 23 16 24 17.5" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
              For families
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              Feel less alone in the therapy journey.
            </h3>
            <ul className="mt-3 space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-[3px] text-sky-600">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M2,9 C4,11 5,13 5,13 C5,13 9,7 14,3" />
                  </svg>
                </span>
                <span className="text-sm leading-relaxed text-slate-800">
                  Emoji‑friendly daily check‑ins from your phone.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] text-sky-600">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M2,9 C4,11 5,13 5,13 C5,13 9,7 14,3" />
                  </svg>
                </span>
                <span className="text-sm leading-relaxed text-slate-800">
                  Progress timelines that highlight small but real wins.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] text-sky-600">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M2,9 C4,11 5,13 5,13 C5,13 9,7 14,3" />
                  </svg>
                </span>
                <span className="text-sm leading-relaxed text-slate-800">
                  Plain‑English summaries you can share with relatives.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] text-sky-600">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M2,9 C4,11 5,13 5,13 C5,13 9,7 14,3" />
                  </svg>
                </span>
                <span className="text-sm leading-relaxed text-slate-800">
                  Three playful, doable home activity ideas each day.
                </span>
              </li>
            </ul>
          </div>
          <div className="flex h-full flex-col rounded-[20px] border border-emerald-100 border-l-4 border-l-emerald-600 bg-[#F0FDF4] p-8">
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100"
              aria-hidden
            >
              <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                stroke="#059669"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="18" r="6" />
                <circle cx="24" cy="22" r="6" />
                <circle cx="14" cy="24" r="6" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              For clinics & centers
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              Bring every discipline into one simple view.
            </h3>
            <ul className="mt-3 space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-[3px] text-emerald-600">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M2,9 C4,11 5,13 5,13 C5,13 9,7 14,3" />
                  </svg>
                </span>
                <span className="text-sm leading-relaxed text-slate-800">
                  Unified child profile across ABA, speech, OT, and school.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] text-emerald-600">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M2,9 C4,11 5,13 5,13 C5,13 9,7 14,3" />
                  </svg>
                </span>
                <span className="text-sm leading-relaxed text-slate-800">
                  Flags when home behavior conflicts with clinic data.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] text-emerald-600">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M2,9 C4,11 5,13 5,13 C5,13 9,7 14,3" />
                  </svg>
                </span>
                <span className="text-sm leading-relaxed text-slate-800">
                  Exportable progress reports for IEPs and insurance.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[3px] text-emerald-600">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M2,9 C4,11 5,13 5,13 C5,13 9,7 14,3" />
                  </svg>
                </span>
                <span className="text-sm leading-relaxed text-slate-800">
                  Built with privacy and parent consent at the center.
                </span>
              </li>
            </ul>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-sky-100 to-transparent" />

        {/* Testimonials */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">
              What early partners are saying
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Real words from families and care teams in our early access program.
            </p>
            <div className="mx-auto mt-3 h-[3px] w-16 rounded-full bg-sky-500" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-3 rounded-3xl bg-white p-4 text-sm shadow-sm shadow-sky-50">
              <div className="relative overflow-hidden rounded-[16px] border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                <Image
                  src="/photos/parent-child-session.png"
                  alt="Parent and child practicing feelings together with visual supports"
                  width={320}
                  height={220}
                  className="h-[220px] w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(255,255,255,0.15)]" />
              </div>
              <div>
                <span className="mb-[-16px] block font-serif text-[64px] leading-none text-[#BFDBFE]">
                  “
                </span>
                <p className="text-[15px] text-slate-800">
                  “For the first time I can open one screen and actually see how
                  school, home, and therapy are lining up for my son.”
                </p>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Parent of a 7‑year‑old, ASD
              </p>
            </div>
            <div className="space-y-3 rounded-3xl bg-white p-4 text-sm shadow-sm shadow-emerald-50">
              <div className="relative overflow-hidden rounded-[16px] border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                <Image
                  src="/photos/group-play.png"
                  alt="Children collaborating with blocks and learning games"
                  width={320}
                  height={220}
                  className="h-[220px] w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(255,255,255,0.15)]" />
              </div>
              <div>
                <span className="mb-[-16px] block font-serif text-[64px] leading-none text-[#BFDBFE]">
                  “
                </span>
                <p className="text-[15px] text-slate-800">
                  “COGNIQA AI turns scattered notes into a shared story. Our
                  interdisciplinary meetings are faster and more focused.”
                </p>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Clinical director, ABA & speech clinic
              </p>
            </div>
            <div className="space-y-3 rounded-3xl bg-white p-4 text-sm shadow-sm shadow-slate-50">
              <div className="relative overflow-hidden rounded-[16px] border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                <Image
                  src="/photos/friendship-circle.png"
                  alt="Neurodiverse children standing together and smiling"
                  width={320}
                  height={220}
                  className="h-[220px] w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(255,255,255,0.15)]" />
              </div>
              <div>
                <span className="mb-[-16px] block font-serif text-[64px] leading-none text-[#BFDBFE]">
                  “
                </span>
                <p className="text-[15px] text-slate-800">
                  “Parents feel empowered instead of overwhelmed. The home
                  activity suggestions are practical and kind.”
                </p>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Special education coordinator
              </p>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-100 to-transparent" />

        {/* FAQ */}
        <FaqSection />

        {/* CTA strip */}
        <section className="rounded-3xl bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-7 text-white md:px-10 md:py-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide">
                Ready to pilot COGNIQA AI?
              </p>
              <p className="max-w-xl text-sm text-sky-50">
                We&apos;re inviting a small group of ASD clinics and schools to
                co‑design the next generation of progress monitoring with us.
              </p>
            </div>
            <Link
              href="/waitlist"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-sky-700 shadow-sm hover:bg-slate-50"
            >
              Request early access
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <p>© {new Date().getFullYear()} COGNIQA AI. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="#how-it-works" className="hover:text-slate-700">
                How it works
              </Link>
              <Link href="#for-clinics" className="hover:text-slate-700">
                For clinics
              </Link>
              <Link href="#about" className="hover:text-slate-700">
                FAQ
              </Link>
              <Link href="/waitlist" className="hover:text-slate-700">
                Waitlist
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
