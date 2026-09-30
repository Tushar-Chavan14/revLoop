// Tags for the cross-visitor data cache (unstable_cache). Every cached public
// read carries PUBLIC_RIDES_TAG, so any write that could change what an
// anonymous visitor sees (a ride, its member count, an organizer's name or
// photo) just invalidates that one tag. Traffic is small enough that one
// broad tag beats tracking which list each ride appears in.
export const PUBLIC_RIDES_TAG = "public-rides";

// Fallback expiry, for changes that don't go through the app (the status
// cron sweep, attendance triggers, a new calendar day).
export const PUBLIC_CACHE_SECONDS = 300;
