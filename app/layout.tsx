import type { Metadata, Viewport } from "next";
import { Fira_Code, Inter } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Stack Trace Decoder — Understand Any JS Error Instantly",
  description:
    "Paste a browser console error or stack trace and get a plain-English explanation, root cause, and exact fix — powered by Claude AI.",
  keywords: [
    "stack trace decoder",
    "javascript error explainer",
    "react error help",
    "typescript error fix",
    "CORS error fix",
    "Next.js error",
    "browser console error",
  ],
  openGraph: {
    title: "Stack Trace Decoder",
    description:
      "Paste any browser error. Get a plain-English explanation and exact fix.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Stack Trace Decoder",
    description:
      "Paste any browser error. Get a plain-English explanation and exact fix.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1117",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
