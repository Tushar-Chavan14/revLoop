"use client";

import { useEffect } from "react";

const COOKIE_NAME = "tz";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

/**
 * Captures the browser's IANA timezone into a plain (non-httpOnly) cookie so
 * Server Components can render time-of-day-sensitive content — greetings,
 * anything keyed off "what hour is it right now" — in the visitor's actual
 * local time instead of wherever the server happens to run. Mount once in
 * the root layout. The very first request before this has ever run (no
 * cookie yet) still falls back to a default — see getUserTimeZone().
 */
export function TimezoneSync() {
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (readCookie(COOKIE_NAME) !== timeZone) {
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(timeZone)}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax`;
    }
  }, []);

  return null;
}
