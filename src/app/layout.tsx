import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "क्षेत्रिकः (Kshetrikah) — Crop Disease & Management for Indian Farmers",
  description:
    "Identify and manage crop diseases with confidence. Free guide to 8 major crops and 30+ diseases — in English and Hindi, mobile-first, works offline.",
  keywords: [
    "crop disease",
    "Indian farming",
    "plant disease identification",
    "agriculture",
    "Kisan",
    "Krishi",
  ],
  authors: [{ name: "क्षेत्रिकः (Kshetrikah)" }],
  openGraph: {
    title: "क्षेत्रिकः (Kshetrikah) — Crop Disease & Management",
    description: "Identify and manage crop diseases. Free for Indian farmers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
