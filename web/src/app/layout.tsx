import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/layout/MainNav";
import type { ReactNode } from "react";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "COGNIQA AI – ASD Progress Companion",
  description:
    "An AI-powered progress monitoring and home reinforcement platform for neurodiverse learners, their families, and therapists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${dmSerif.variable} antialiased soft-gradient-bg font-sans`}
      >
        <MainNav />
        {children}
      </body>
    </html>
  );
}
