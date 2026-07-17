import { cookies } from "next/headers";

const COOKIE_NAME = "tz";
const DEFAULT_TIME_ZONE = "UTC";

/**
 * The visitor's IANA timezone, captured client-side by <TimezoneSync/> in
 * the root layout. Falls back to UTC before that cookie has ever been set
 * (a user's very first request) or if it somehow holds garbage.
 */
export async function getUserTimeZone(): Promise<string> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) {
    return DEFAULT_TIME_ZONE;
  }

  try {
    // Throws for anything that isn't a real IANA zone name.
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return value;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}
