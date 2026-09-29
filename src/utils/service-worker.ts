// Single source of truth for registering public/sw.js — the ride alerts card
// and AppInstallProvider must register the exact same URL, or the browser
// treats them as two different workers and keeps swapping between them.
//
// In development the worker only handles ride alerts: page-load interception
// (the "no signal" fallback) is switched off via `?offline=0`, because the
// dev server's hot reload and a worker that answers page loads can fight each
// other into a reload loop (seen in Firefox). Production builds don't have
// hot reload, so the fallback runs there.
const SERVICE_WORKER_URL =
  process.env.NODE_ENV === "production" ? "/sw.js" : "/sw.js?offline=0";

export function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register(SERVICE_WORKER_URL, {
    scope: "/",
    updateViaCache: "none",
  });
}
