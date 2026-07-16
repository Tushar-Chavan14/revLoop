"use client";

import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const bebasNeue = Bebas_Neue({ variable: "--font-bebas-neue", subsets: ["latin"], weight: "400" });

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable} h-full antialiased`}>
      <body className="bg-background text-foreground flex min-h-full flex-col items-center justify-center gap-6 px-6 py-16">
        <p className="font-display text-5xl uppercase">RevLoop</p>
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <p className="font-heading text-xl font-bold">Something went badly wrong</p>
          <p className="text-muted-foreground text-sm">
            The app hit a snag loading this page. Try again in a moment.
          </p>
        </div>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
