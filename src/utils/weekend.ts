const DAY_MS = 24 * 60 * 60 * 1000;

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** The upcoming Saturday–Sunday window (today's own weekend if it's already Sat/Sun). */
export function getUpcomingWeekendRange(now = new Date()) {
  const day = now.getDay();
  const daysUntilSaturday = day === 6 ? 0 : day === 0 ? -1 : 6 - day;
  const saturday = new Date(now.getTime() + daysUntilSaturday * DAY_MS);
  const sunday = new Date(saturday.getTime() + DAY_MS);
  return { start: toISODate(saturday), end: toISODate(sunday) };
}
