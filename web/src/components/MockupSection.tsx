"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type FaqMoodEmoji = "😢" | "😕" | "😐" | "🙂" | "😄";
type BigWinsSelection = "yes" | "partly" | "notyet";

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-3 pt-2 text-[11px] text-slate-400">
      <span>9:41</span>
      <div className="flex items-center gap-2">
        {/* Signal */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M3 17H6" />
          <path d="M7 13H9" />
          <path d="M11 9H12" />
          <path d="M15 5H15" />
        </svg>
        {/* Battery */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12V12C3 10.343 4.343 9 6 9H18C19.657 9 21 10.343 21 12V12C21 13.657 19.657 15 18 15H6C4.343 15 3 13.657 3 12Z" />
          <path d="M22 12H21" />
        </svg>
      </div>
    </div>
  );
}

function DeviceFrame({
  kind,
  children,
}: {
  kind: "phone" | "tablet";
  children: React.ReactNode;
}) {
  const isPhone = kind === "phone";
  return (
    <div
      className="relative select-none"
      style={{
        width: isPhone ? 402 : 760,
        maxWidth: "92vw",
      }}
    >
      <div
        className="rounded-[32px] bg-[#1e293b] p-[12px]"
        style={{
          boxShadow:
            "0 18px 45px rgba(15, 23, 42, 0.18), 0 2px 10px rgba(15, 23, 42, 0.08)",
        }}
      >
        {isPhone && (
          <div className="pointer-events-none absolute left-1/2 top-[10px] h-[18px] w-[96px] -translate-x-1/2 rounded-b-[18px] bg-[#0f172a]" />
        )}
        <div className="relative overflow-hidden rounded-[20px] bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}

function SketchIconSpeech({ stroke = "#2563EB" }: { stroke?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M4 6.5C4 5.12 5.12 4 6.5 4H17.5C18.88 4 20 5.12 20 6.5V14C20 15.38 18.88 16.5 17.5 16.5H9L6 19.5V16.5H6.5C5.12 16.5 4 15.38 4 14V6.5Z" />
      <path d="M7.5 8.5H16.5" />
      <path d="M7.5 11.5H13" />
    </svg>
  );
}

function SketchIconStar({ stroke = "#059669" }: { stroke?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M12 3.8L14.6 9.2L20.6 10L16.3 14.1L17.4 20.2L12 17.4L6.6 20.2L7.7 14.1L3.4 10L9.4 9.2L12 3.8Z" />
    </svg>
  );
}

function SketchIconHeart({ stroke = "#8B5CF6" }: { stroke?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M12 20.5C12 20.5 4.5 16.2 4.5 10.6C4.5 7.8 6.7 5.6 9.5 5.6C10.9 5.6 12 6.3 12 6.3C12 6.3 13.1 5.6 14.5 5.6C17.3 5.6 19.5 7.8 19.5 10.6C19.5 16.2 12 20.5 12 20.5Z" />
    </svg>
  );
}

function SketchIconSparkle({ stroke = "#8B5CF6" }: { stroke?: string }) {
  // Simple hand-drawn-ish sparkle.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M12 2.7L13.2 8.1L18.3 9.3L13.2 10.5L12 15.9L10.8 10.5L5.7 9.3L10.8 8.1L12 2.7Z" />
      <path d="M20.2 14.2L20.8 16.6L23.2 17.2L20.8 17.8L20.2 20.2L19.6 17.8L17.2 17.2L19.6 16.6L20.2 14.2Z" />
    </svg>
  );
}

function SparkIconCircle({
  bg,
  stroke,
}: {
  bg: string;
  stroke: string;
}) {
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full"
      style={{ background: bg }}
      aria-hidden
    >
      <SketchIconSparkle stroke={stroke} />
    </div>
  );
}

export default function MockupSection() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  const [mood, setMood] = useState<FaqMoodEmoji>("🙂");
  const [wins, setWins] = useState<string>("Pointed to the dog!");
  const [triedActivities, setTriedActivities] =
    useState<BigWinsSelection>("yes");

  const [saved, setSaved] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
  });
  const [done, setDone] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
  });

  const mockupOrder = useMemo(() => [0, 1, 2], []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const MOODS: FaqMoodEmoji[] = ["😢", "😕", "😐", "🙂", "😄"];
  const triedPills: { id: BigWinsSelection; label: string }[] = [
    { id: "yes", label: "Yes ✓" },
    { id: "partly", label: "Partly" },
    { id: "notyet", label: "Not yet" },
  ];

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
      }}
      className="pt-14 pb-4"
      style={{
        background:
          "linear-gradient(180deg, #EFF6FF 0%, #F0FDF4 100%)",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
      }}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            SEE IT IN ACTION
          </p>
          <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
            Built for real life. Not for reports.
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            Here's what parents and clinicians actually see when they open
            COGNIQA AI.
          </p>
        </div>

        <div className="mt-8 grid items-start gap-6 md:grid-cols-12">
          {/* Mockup 2 — left phone (slightly lower) */}
          <div
            className="md:col-span-3"
            style={{
              transitionDelay: `${mockupOrder[1] * 150}ms`,
            }}
          >
            <div
              className={[
                "transition-all duration-700 ease-out",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
              ].join(" ")}
            >
              <div className="group translate-y-1 transition-transform duration-300 hover:-translate-y-2">
                <DeviceFrame kind="phone">
                  <div className="h-[680px] text-[#1e293b]">
                    <StatusBar />
                    <div className="flex items-center justify-between px-3 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl leading-none" aria-hidden>
                          ←
                        </span>
                        <span className="text-[13px] font-semibold">
                          Today's Activities
                        </span>
                      </div>
                      <span aria-hidden className="text-lg">
                        ✨
                      </span>
                    </div>

                    <div className="mx-3 mt-3 rounded-2xl bg-emerald-50 p-3">
                      <div className="flex items-center gap-3">
                        <SparkIconCircle bg="#EDE9FE" stroke="#7C3AED" />
                        <p className="text-[13px] font-normal leading-relaxed text-slate-700">
                          Hi! Based on today's check-in and [child's] therapy
                          goals, here are 3 things to try this afternoon.
                        </p>
                      </div>
                    </div>

                    <div className="mx-3 mt-3 space-y-3 overflow-auto pb-24">
                      <div className="rounded-2xl bg-white/90 p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                            <SketchIconSpeech stroke="#2563EB" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#3B82F6]">
                              SPEECH · 12 MIN
                            </p>
                            <p className="mt-1 font-medium text-slate-900">
                              Color pointing game
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-[13px] leading-relaxed text-slate-700">
                          While making dinner, ask your child to point to 3
                          colors they can see. Celebrate each one loudly! 🎉
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSaved((prev) => ({ ...prev, 0: !prev[0] }))
                            }
                            className={`flex-1 rounded-xl px-2 py-2 text-[12px] font-semibold transition ${
                              saved[0]
                                ? "bg-[#DBEAFE] text-[#2563EB]"
                                : "bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            ⭐ Save idea
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDone((prev) => ({ ...prev, 0: !prev[0] }))
                            }
                            className={`flex-1 rounded-xl px-2 py-2 text-[12px] font-semibold transition ${
                              done[0]
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {done[0] ? "✓ Mark done" : "✓ Mark done"}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/90 p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <SketchIconStar stroke="#059669" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#10B981]">
                              SOCIAL · 10 MIN
                            </p>
                            <p className="mt-1 font-medium text-slate-900">
                              Mirror faces game
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-[13px] leading-relaxed text-slate-700">
                          Sit face-to-face and make silly faces. When they copy
                          you, celebrate! This builds the eye contact their OT is
                          working on.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSaved((prev) => ({ ...prev, 1: !prev[1] }))
                            }
                            className={`flex-1 rounded-xl px-2 py-2 text-[12px] font-semibold transition ${
                              saved[1]
                                ? "bg-[#D1FAE5] text-[#059669]"
                                : "bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            ⭐ Save idea
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDone((prev) => ({ ...prev, 1: !prev[1] }))
                            }
                            className={`flex-1 rounded-xl px-2 py-2 text-[12px] font-semibold transition ${
                              done[1]
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            ✓ Mark done
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/90 p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                            <SketchIconHeart stroke="#8B5CF6" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8B5CF6]">
                              ROUTINE · 5 MIN
                            </p>
                            <p className="mt-1 font-medium text-slate-900">
                              Goodbye song
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-[13px] leading-relaxed text-slate-700">
                          Sing a simple goodbye song at bedtime — same tune
                          every night. Helps with transitions and builds language
                          rhythm.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSaved((prev) => ({ ...prev, 2: !prev[2] }))
                            }
                            className={`flex-1 rounded-xl px-2 py-2 text-[12px] font-semibold transition ${
                              saved[2]
                                ? "bg-[#EDE9FE] text-[#7C3AED]"
                                : "bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            ⭐ Save idea
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDone((prev) => ({ ...prev, 2: !prev[2] }))
                            }
                            className={`flex-1 rounded-xl px-2 py-2 text-[12px] font-semibold transition ${
                              done[2]
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            ✓ Mark done
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-0 right-0 px-3">
                      <p className="text-center text-[11px] text-slate-500">
                        ✨ Powered by Niqa · Always reviewed by your care team
                      </p>
                    </div>
                  </div>
                </DeviceFrame>
              </div>
            </div>
          </div>

          {/* Mockup 1 — center phone (slightly elevated) */}
          <div
            className="md:col-span-3"
            style={{
              transitionDelay: `${mockupOrder[0] * 150}ms`,
            }}
          >
            <div
              className={[
                "transition-all duration-700 ease-out",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
              ].join(" ")}
            >
              <div className="group -translate-y-1 transition-transform duration-300 hover:-translate-y-2">
                <DeviceFrame kind="phone">
                  <div className="h-[680px] text-[#1e293b]">
                    <StatusBar />
                    <div className="flex items-center justify-between px-3 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DBEAFE]">
                          <span className="text-sm font-bold text-[#3B82F6]">
                            CQ
                          </span>
                        </div>
                      </div>
                      <div className="text-[13px] font-semibold">
                        Good morning! ☀️
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#99F6E4]">
                          <span className="text-sm font-bold text-[#0f766e]">
                            M
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mx-3 mt-4 rounded-2xl border border-slate-100 bg-white p-3">
                      <p className="text-[14px] font-bold text-slate-900">
                        How was today?
                      </p>
                      <p className="mt-0.5 text-[12px] text-slate-500">
                        Takes about 2 minutes
                      </p>

                      <div className="mt-3">
                        <p className="text-[12px] font-semibold text-slate-800">
                          How was the mood today?
                        </p>
                        <div
                          className="mt-2 flex items-center justify-between rounded-xl bg-sky-50 px-2 py-2 animate-[pulse_2.8s_ease-in-out_infinite]"
                          style={{
                            animationDelay: "0ms",
                          }}
                        >
                          {MOODS.map((e) => {
                            const selected = mood === e;
                            return (
                              <button
                                key={e}
                                type="button"
                                onClick={() => setMood(e)}
                                className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                  selected
                                    ? "bg-[#DBEAFE] text-[#2563EB] shadow-sm"
                                    : "bg-transparent text-slate-700 hover:bg-white"
                                }`}
                                aria-pressed={selected}
                              >
                                <span className="text-[18px]">{e}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-[12px] font-semibold text-slate-800">
                          Any big wins today?
                        </p>
                        <input
                          value={wins}
                          onChange={(e) => setWins(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-[13px] text-slate-900 outline-none"
                          placeholder="e.g. Said a new word, made eye contact..."
                        />
                      </div>

                      <div className="mt-3">
                        <p className="text-[12px] font-semibold text-slate-800">
                          Did you try yesterday&apos;s activities?
                        </p>
                        <div className="mt-2 flex gap-2">
                          {triedPills.map((pill) => {
                            const selected = triedActivities === pill.id;
                            return (
                              <button
                                key={pill.id}
                                type="button"
                                onClick={() => setTriedActivities(pill.id)}
                                className={`flex-1 rounded-full border px-2 py-2 text-[12px] font-semibold transition ${
                                  selected
                                    ? "border-[#3B82F6] bg-[#3B82F6] text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {pill.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="mt-3 h-[52px] w-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#0f766e] text-[14px] font-semibold text-white shadow-sm transition hover:brightness-105"
                      >
                        See today&apos;s activities →
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="mx-3 mb-3 rounded-2xl border border-slate-100 bg-white">
                        <div className="flex items-center justify-between px-4 py-3">
                          <button
                            type="button"
                            className="flex flex-col items-center text-[#3B82F6]"
                          >
                            <span aria-hidden>🏠</span>
                          </button>
                          <button
                            type="button"
                            className="flex flex-col items-center text-slate-500"
                          >
                            <span aria-hidden>📊</span>
                          </button>
                          <button
                            type="button"
                            className="flex flex-col items-center text-slate-500"
                          >
                            <span aria-hidden>💬</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </DeviceFrame>
              </div>
            </div>
          </div>

          {/* Mockup 3 — right tablet/dashboard */}
          <div
            className="md:col-span-6"
            style={{
              transitionDelay: `${mockupOrder[2] * 150}ms`,
            }}
          >
            <div
              className={[
                "transition-all duration-700 ease-out",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
              ].join(" ")}
            >
              <div className="group translate-y-0 transition-transform duration-300 hover:-translate-y-2">
                <DeviceFrame kind="tablet">
                  <div className="h-[680px] text-[#1e293b]">
                    <div className="flex h-full">
                      {/* Sidebar */}
                      <aside className="w-[200px] bg-[#1e293b] px-4 py-4 text-white">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3B82F6]">
                            <span className="text-sm font-bold">CQ</span>
                          </div>
                          <p className="text-sm font-semibold tracking-wide">
                            COGNIQA AI
                          </p>
                        </div>

                        <nav className="mt-6 space-y-2 text-sm">
                          <a
                            href="#"
                            className="flex items-center gap-2 rounded-xl bg-[#3B82F6] px-3 py-2 text-white"
                          >
                            <span aria-hidden>🏠</span>
                            Dashboard
                          </a>
                          <a
                            href="#"
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-white/90 hover:bg-white/10"
                          >
                            <span aria-hidden>👶</span>
                            My Children
                          </a>
                          <a
                            href="#"
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-white/90 hover:bg-white/10"
                          >
                            <span aria-hidden>📊</span>
                            Reports
                          </a>
                          <a
                            href="#"
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-white/90 hover:bg-white/10"
                          >
                            <span aria-hidden>💬</span>
                            Messages
                          </a>
                          <a
                            href="#"
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-white/90 hover:bg-white/10"
                          >
                            <span aria-hidden>⚙️</span>
                            Settings
                          </a>
                        </nav>

                        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                            <span className="text-sm font-semibold">S</span>
                          </div>
                          <div className="leading-tight">
                            <p className="text-sm font-semibold">Dr. Sarah M.</p>
                            <p className="text-[11px] text-white/70">Therapist</p>
                          </div>
                        </div>
                      </aside>

                      {/* Main content */}
                      <div className="flex flex-1 bg-slate-50">
                        <div className="flex-1 px-4 py-4">
                          {/* Top bar */}
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900">
                              Good morning, Sarah 👋
                            </p>
                            <button
                              type="button"
                              className="rounded-xl bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2563EB]"
                            >
                              + Add child
                            </button>
                          </div>

                          {/* Children grid */}
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-[#2563EB]">
                                  A
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    Child A · Age 7
                                  </p>
                                  <div className="mt-1 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700">
                                      ABA
                                    </span>
                                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                                      Speech
                                    </span>
                                    <span className="rounded-full bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">
                                      OT
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <p className="text-[12px] text-slate-600">
                                  Mood trend: 📈
                                </p>
                                <div className="h-8 w-18 rounded-full bg-sky-50" />
                              </div>
                              <div className="mt-2 text-[12px] text-slate-600">
                                Last check-in: 2 hours ago
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                <span className="text-[12px] font-semibold text-slate-800">
                                  Active today
                                </span>
                              </div>
                              <button
                                type="button"
                                className="mt-3 w-full rounded-xl bg-white px-3 py-2 text-[12px] font-semibold text-[#3B82F6] ring-1 ring-slate-200 hover:bg-slate-50"
                              >
                                View full profile →
                              </button>
                            </div>

                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  Child B · Age 5
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700">
                                    ABA
                                  </span>
                                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                                    Speech
                                  </span>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <p className="text-[12px] text-slate-600">
                                  Mood trend: flat line
                                </p>
                                <div className="h-8 w-18 rounded-full bg-slate-100" />
                              </div>
                              <div className="mt-2 text-[12px] text-slate-600">
                                Last check-in: Yesterday
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                <span className="text-[12px] font-semibold text-slate-800">
                                  Check-in due
                                </span>
                              </div>
                              <div className="mt-3 rounded-2xl bg-orange-50 p-3 animate-[pulse_2.6s_ease-in-out_infinite]">
                                <p className="text-[12px] font-semibold text-orange-700">
                                  ⚠️ Home data conflict — review
                                </p>
                              </div>
                              <button
                                type="button"
                                className="mt-3 w-full rounded-xl bg-white px-3 py-2 text-[12px] font-semibold text-[#3B82F6] ring-1 ring-slate-200 hover:bg-slate-50"
                              >
                                View full profile →
                              </button>
                            </div>

                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  Child C · Age 4
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="rounded-full bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">
                                    OT
                                  </span>
                                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                                    School
                                  </span>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <p className="text-[12px] text-slate-600">
                                  Mood trend: —
                                </p>
                                <div className="h-8 w-18 rounded-full bg-slate-100" />
                              </div>
                              <div className="mt-2 text-[12px] text-slate-600">
                                Last check-in: 3 days ago
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                                <span className="text-[12px] font-semibold text-slate-800">
                                  No recent data
                                </span>
                              </div>
                              <button
                                type="button"
                                className="mt-3 w-full rounded-xl bg-white px-3 py-2 text-[12px] font-semibold text-[#3B82F6] ring-1 ring-slate-200 hover:bg-slate-50"
                              >
                                View full profile →
                              </button>
                            </div>

                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  Child D · Age 6
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700">
                                    ABA
                                  </span>
                                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                                    Speech
                                  </span>
                                  <span className="rounded-full bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">
                                    OT
                                  </span>
                                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                                    School
                                  </span>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <p className="text-[12px] text-slate-600">
                                  Mood trend: 📈
                                </p>
                                <div className="h-8 w-18 rounded-full bg-sky-50" />
                              </div>
                              <div className="mt-2 text-[12px] text-slate-600">
                                Last check-in: 1 hour ago
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                <span className="text-[12px] font-semibold text-slate-800">
                                  Active today
                                </span>
                              </div>
                              <button
                                type="button"
                                className="mt-3 w-full rounded-xl bg-white px-3 py-2 text-[12px] font-semibold text-[#3B82F6] ring-1 ring-slate-200 hover:bg-slate-50"
                              >
                                View full profile →
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Right highlight panel */}
                        <aside className="hidden w-[220px] flex-col px-4 py-4 md:flex">
                          <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-sm font-semibold text-slate-900">
                              This week&apos;s highlights
                            </p>
                            <ul className="mt-3 space-y-2 text-[12px] text-slate-700">
                              <li>• 4 families logged check-ins today</li>
                              <li>• 2 new AI summaries ready</li>
                              <li>• 1 conflict flag to review</li>
                            </ul>
                            <button
                              type="button"
                              className="mt-4 w-full rounded-xl bg-white px-3 py-2 text-[12px] font-semibold text-[#3B82F6] ring-1 ring-slate-200 hover:bg-slate-50"
                            >
                              View all →
                            </button>
                          </div>
                        </aside>
                      </div>
                    </div>
                  </div>
                </DeviceFrame>
              </div>
            </div>
          </div>
        </div>

        {/* Trust badge row */}
        <div className="mt-10 text-center text-xs text-slate-500">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span aria-hidden>🔒</span>
            <span>HIPAA-conscious design</span>
            <span aria-hidden className="text-slate-400">
              ·
            </span>
            <span aria-hidden>📱</span>
            <span>Works on any device</span>
            <span aria-hidden className="text-slate-400">
              ·
            </span>
            <span aria-hidden>✨</span>
            <span>AI reviewed by clinicians</span>
            <span aria-hidden className="text-slate-400">
              ·
            </span>
            <span aria-hidden>🏠</span>
            <span>Built by an ASD parent</span>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-5 flex flex-col items-center justify-center gap-3 pb-12 md:flex-row">
          <Link
            href="/waitlist"
            className="inline-flex h-[44px] items-center justify-center rounded-full bg-[#3B82F6] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#2563EB]"
          >
            See it as a parent →
          </Link>
          <Link
            href="/waitlist"
            className="inline-flex h-[44px] items-center justify-center rounded-full border border-[#3B82F6] bg-white px-6 text-sm font-semibold text-[#3B82F6] shadow-sm hover:bg-[#DBEAFE]"
          >
            See it as a clinic →
          </Link>
        </div>
      </div>
    </section>
  );
}

