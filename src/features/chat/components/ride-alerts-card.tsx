"use client";

import { useEffect, useState } from "react";
import { BellOff, BellRing, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  removeRideAlertSubscription,
  saveRideAlertSubscription,
} from "@/features/chat/actions/chat-actions";
import { toast } from "@/lib/toast";
import { isInstalledApp, isIOSDevice } from "@/utils/device";
import { registerServiceWorker } from "@/utils/service-worker";

type AlertState = "checking" | "unavailable" | "install-first" | "off" | "on" | "blocked";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

/**
 * "Ride alerts" opt-in — a ping on this device whenever someone in one of the
 * rider's ride chats sends a message. Alerts are per device (each browser
 * or installed app turns them on separately).
 */
export function RideAlertsCard() {
  const [state, setState] = useState<AlertState>("checking");
  const [busy, setBusy] = useState(false);
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const supported =
        "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      if (!supported) {
        // iPhone Safari only offers alerts once RoadKin is on the Home Screen.
        setState(isIOSDevice() && !isInstalledApp() ? "install-first" : "unavailable");
        return;
      }
      if (!vapidKey) {
        setState("unavailable");
        return;
      }
      if (Notification.permission === "denied") {
        setState("blocked");
        return;
      }

      const registration = await registerServiceWorker();
      const existing = await registration.pushManager.getSubscription();
      if (cancelled) {
        return;
      }
      if (existing && Notification.permission === "granted") {
        setState("on");
        // Re-save on every visit so the device follows whoever is signed in.
        void saveRideAlertSubscription(existing.toJSON() as never, navigator.userAgent);
      } else {
        setState("off");
      }
    }

    check().catch(() => setState("unavailable"));
    return () => {
      cancelled = true;
    };
  }, [vapidKey]);

  async function turnOn() {
    if (!vapidKey) {
      return;
    }
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "off");
        return;
      }
      const registration = await registerServiceWorker();
      await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        }));
      const result = await saveRideAlertSubscription(
        subscription.toJSON() as never,
        navigator.userAgent,
      );
      if (result.error) {
        toast.error({ title: result.error });
        return;
      }
      setState("on");
      toast.success({
        title: "Ride alerts are on",
        description: "You'll get a ping when your crew sends a message.",
      });
    } catch {
      toast.error({ title: "Couldn't turn on ride alerts, please try again." });
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await removeRideAlertSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setState("off");
    } finally {
      setBusy(false);
    }
  }

  if (state === "checking" || state === "unavailable") {
    return null;
  }

  if (state === "on") {
    return (
      <div className="border-border bg-card flex items-center gap-3 rounded-2xl border px-4 py-3">
        <BellRing className="text-muted-foreground size-4 shrink-0" aria-hidden />
        <p className="flex-1 text-sm">Ride alerts are on for this device.</p>
        <Button type="button" variant="ghost" size="sm" onClick={turnOff} disabled={busy}>
          Turn Off
        </Button>
      </div>
    );
  }

  if (state === "blocked") {
    return (
      <div className="border-border bg-card flex items-start gap-3 rounded-2xl border px-4 py-3">
        <BellOff className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
        <p className="text-muted-foreground text-sm">
          Ride alerts are blocked on this device. Allow notifications for RoadKin in your browser
          settings to hear from your crew.
        </p>
      </div>
    );
  }

  if (state === "install-first") {
    return (
      <div className="border-border bg-card flex items-start gap-3 rounded-2xl border px-4 py-3">
        <Share className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
        <p className="text-muted-foreground text-sm">
          Want a ping when your crew talks? Tap{" "}
          <span className="text-foreground font-medium">Share → Add to Home Screen</span>, then open
          RoadKin from your Home Screen to turn on ride alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-4">
      <div className="flex items-start gap-3">
        <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
          <BellRing className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-sm font-semibold">Never miss a word from your crew</p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Get a ping on this device the moment someone in your ride chats speaks up.
          </p>
        </div>
      </div>
      <Button type="button" onClick={turnOn} disabled={busy} className="w-full">
        Turn On Ride Alerts
      </Button>
    </div>
  );
}
