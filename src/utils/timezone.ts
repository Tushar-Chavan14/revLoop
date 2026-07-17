/** The current hour (0–23) as it reads in the given IANA timezone. */
export function getHourInTimeZone(timeZone: string, now = new Date()): number {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hour12: false,
  }).format(now);
  // "24" shows up for midnight with hour12:false in some engines — normalize.
  return Number(hour) % 24;
}
