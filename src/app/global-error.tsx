"use client";

import "./globals.css";
import { APP_NAME } from "@/constants/site";
import { bebasNeue, manrope } from "./fonts";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${bebasNeue.variable} h-full antialiased`}>
      <body className="bg-background text-foreground flex min-h-full flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6">
        <p className="font-display text-5xl">{APP_NAME}</p>
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <h1 className="font-display text-6xl leading-[0.9]">Something went badly wrong</h1>
          <p className="text-muted-foreground text-base">
            The app hit a snag loading this page. Try again in a moment.
          </p>
        </div>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="bg-primary text-primary-foreground hover:bg-primary-hover h-10 rounded-md px-4 text-sm font-bold transition-colors"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
