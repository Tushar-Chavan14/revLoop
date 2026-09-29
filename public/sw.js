// RoadKin service worker — ride alerts (web push), plus a single "no signal"
// page for when a page can't load offline. No offline caching of the app
// itself: every request still goes straight to the network.

const OFFLINE_CACHE = "roadkin-offline-v4";
// Registered as /sw.js?offline=0 in development (see src/utils/service-worker.ts):
// ride alerts only, no page-load interception, so it can't fight hot reload.
const OFFLINE_FALLBACK_ENABLED = new URL(self.location.href).searchParams.get("offline") !== "0";
const OFFLINE_URL = "/offline.html";
const OFFLINE_ASSETS = [OFFLINE_URL, "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(OFFLINE_CACHE);
      // cache: "reload" skips the HTTP cache so a stale copy is never saved.
      await cache.addAll(OFFLINE_ASSETS.map((url) => new Request(url, { cache: "reload" })));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== OFFLINE_CACHE).map((key) => caches.delete(key)),
      );
      // Start page loads in parallel with the worker booting, so having a
      // service worker never makes navigation slower.
      if (self.registration.navigationPreload) {
        if (OFFLINE_FALLBACK_ENABLED) {
          await self.registration.navigationPreload.enable();
        } else {
          await self.registration.navigationPreload.disable();
        }
      }
      await self.clients.claim();
    })(),
  );
});

// Only full page loads (plus the "no signal" page's own icon) are touched —
// scripts, other images, API and data requests never go through here.
self.addEventListener("fetch", (event) => {
  if (!OFFLINE_FALLBACK_ENABLED) {
    return;
  }
  const isOfflineAsset = OFFLINE_ASSETS.includes(new URL(event.request.url).pathname);
  // The "no signal" page's icon: network first, saved copy when offline.
  if (isOfflineAsset && event.request.mode !== "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(OFFLINE_CACHE);
        return (await cache.match(event.request, { ignoreSearch: true })) ?? Response.error();
      }),
    );
    return;
  }
  if (event.request.mode !== "navigate") {
    return;
  }
  event.respondWith(
    (async () => {
      try {
        const preloaded = await event.preloadResponse;
        if (preloaded) {
          return preloaded;
        }
        return await fetch(event.request);
      } catch {
        const cache = await caches.open(OFFLINE_CACHE);
        return (await cache.match(OFFLINE_URL)) ?? Response.error();
      }
    })(),
  );
});

function chatPath(rideId) {
  return `/chats/${rideId}`;
}

// Is the rider already looking at this ride's chat in a focused window?
async function isChatOnScreen(rideId) {
  const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  return windows.some((client) => {
    if (!client.focused || client.visibilityState !== "visible") {
      return false;
    }
    const url = new URL(client.url);
    return (
      url.pathname === chatPath(rideId) ||
      (url.pathname === `/rides/${rideId}` && url.searchParams.get("chat") === "open")
    );
  });
}

self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let payload;
  try {
    payload = event.data.json();
  } catch {
    // Plain-text push (e.g. the "Push" test button in browser DevTools) —
    // show it as-is so the alert path can be checked without the app.
    event.waitUntil(
      self.registration.showNotification("RoadKin", {
        body: event.data.text(),
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-96.png",
      }),
    );
    return;
  }
  if (payload.kind !== "ride_chat") {
    return;
  }

  event.waitUntil(
    (async () => {
      if (await isChatOnScreen(payload.rideId)) {
        return;
      }

      // One alert per ride chat: a new message replaces the previous alert and
      // bumps its count, instead of stacking ten separate pings.
      const tag = `ride-chat-${payload.rideId}`;
      const existing = await self.registration.getNotifications({ tag });
      const count = (existing[0]?.data?.count ?? 0) + 1;

      await self.registration.showNotification(
        count > 1 ? `${payload.rideTitle} · ${count} new messages` : payload.rideTitle,
        {
          body: `${payload.senderName}: ${payload.preview}`,
          tag,
          renotify: true,
          icon: "/icons/icon-192.png",
          badge: "/icons/badge-96.png",
          data: { url: payload.url, count },
        },
      );
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url ?? "/chats", self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      // Reuse an open RoadKin tab/app window rather than opening another one.
      const client = windows.find((w) => new URL(w.url).origin === self.location.origin);
      if (client) {
        await client.focus();
        if ("navigate" in client) {
          await client.navigate(target);
        }
        return;
      }
      await self.clients.openWindow(target);
    })(),
  );
});
