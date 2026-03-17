"use client";

import { useState } from "react";

type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

const ITEMS: FaqItem[] = [
  {
    id: 1,
    question: "Is COGNIQA AI a replacement for our existing EMR or school systems?",
    answer:
      "No. COGNIQA AI sits on top of what you already use, giving a shared, human‑readable view of progress and behavior rather than replacing clinical records.",
  },
  {
    id: 2,
    question: "How do you protect family privacy?",
    answer:
      "We follow strict access controls, encrypt data in transit and at rest, and only share information with the care team members that families explicitly approve.",
  },
  {
    id: 3,
    question: "Do parents need any training to use it?",
    answer:
      "Most parents complete their first check‑in in under two minutes. The language is simple, emoji‑friendly, and works well on any smartphone.",
  },
  {
    id: 4,
    question: "Is this app free for families?",
    answer:
      "Yes. The parent experience is completely free. Clinics and schools pay a small monthly fee to access the unified dashboard and AI summaries for their care teams.",
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <section id="about" className="py-12 md:py-12">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-50">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 22 H18" />
              <path d="M16 6 Q10 6 10 11 Q10 14 13 15 Q16 16 16 19" />
              <circle cx="16" cy="16" r="11" />
            </svg>
          </span>
          <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">
            Questions we hear a lot
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          Still wondering? We probably have the answer below.
        </p>
      </div>

      <div className="mt-6 space-y-2">
        {ITEMS.map((item) => {
          const isOpen = openId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`w-full rounded-[12px] border px-6 py-5 text-left transition-all duration-200 ${
                isOpen
                  ? "border-sky-500 bg-white"
                  : "border-slate-200 bg-white hover:border-[#BFDBFE] hover:bg-[#F8FAFF]"
              }`}
              onClick={() => setOpenId(isOpen ? null : item.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-semibold text-slate-900">
                  {item.question}
                </p>
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center text-sky-500">
                  {isOpen ? (
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4 L16 16" />
                      <path d="M16 4 L4 16" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 4 L10 16" />
                      <path d="M4 10 L16 10" />
                    </svg>
                  )}
                </span>
              </div>
              <div
                className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                style={{ maxHeight: isOpen ? 200 : 0 }}
              >
                <p className="pt-3 text-sm leading-relaxed text-slate-600">
                  {item.answer}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

