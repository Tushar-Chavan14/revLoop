import "server-only";
import webpush, { WebPushError } from "web-push";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const PREVIEW_LENGTH = 140;
// A ride chat alert is stale after half a day — no point waking a phone that
// was off all weekend with Friday's "who's bringing the tyre kit?".
const ALERT_TTL_SECONDS = 60 * 60 * 12;

// Only real browser push services — the endpoint comes from the browser, so
// without this a crafted subscription could make the server POST anywhere.
const PUSH_SERVICE_HOST_SUFFIXES = [
  ".googleapis.com",
  ".mozilla.com",
  ".mozilla.org",
  ".apple.com",
  ".windows.com",
];

let vapidConfigured = false;

function configureVapid(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return false;
  }
  if (!vapidConfigured) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT ?? "mailto:hello@roadkin.app",
      publicKey,
      privateKey,
    );
    vapidConfigured = true;
  }
  return true;
}

export function isAllowedPushEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    return (
      url.protocol === "https:" &&
      PUSH_SERVICE_HOST_SUFFIXES.some((suffix) => url.hostname.endsWith(suffix))
    );
  } catch {
    return false;
  }
}

/** What the service worker (public/sw.js) receives for a ride chat alert. */
export interface RideChatAlertPayload {
  kind: "ride_chat";
  rideId: string;
  rideTitle: string;
  senderName: string;
  preview: string;
  url: string;
}

interface RideChatAlertInput {
  rideId: string;
  senderId: string;
  senderName: string | null;
  body: string;
}

/**
 * Pings every other member of the ride on every device they've turned ride
 * alerts on for. Runs after the message is already saved (via `after()`), so
 * a slow or failing push service never delays or fails the send itself.
 */
export async function sendRideChatAlerts({
  rideId,
  senderId,
  senderName,
  body,
}: RideChatAlertInput): Promise<void> {
  if (!configureVapid()) {
    console.warn("[ride alerts] skipped: VAPID keys are not set on the server");
    return;
  }

  const admin = createServiceRoleClient();
  const [{ data: ride }, { data: members }] = await Promise.all([
    admin.from("rides").select("title").eq("id", rideId).maybeSingle(),
    admin.from("ride_members").select("user_id").eq("ride_id", rideId).neq("user_id", senderId),
  ]);
  const recipientIds = (members ?? []).map((member) => member.user_id);
  if (recipientIds.length === 0) {
    return;
  }

  const { data: subscriptions, error: subscriptionsError } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("user_id", recipientIds);
  if (subscriptionsError) {
    console.error("[ride alerts] couldn't load subscriptions:", subscriptionsError.message);
    return;
  }
  if (!subscriptions?.length) {
    return;
  }

  const preview = body.length > PREVIEW_LENGTH ? `${body.slice(0, PREVIEW_LENGTH - 1)}…` : body;
  const payload: RideChatAlertPayload = {
    kind: "ride_chat",
    rideId,
    rideTitle: ride?.title ?? "Your ride crew",
    senderName: senderName ?? "A rider",
    preview,
    url: `/chats/${rideId}`,
  };
  const serialized = JSON.stringify(payload);

  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        serialized,
        { TTL: ALERT_TTL_SECONDS, urgency: "high" },
      ),
    ),
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const reason = result.reason as { statusCode?: number; body?: string; message?: string };
      console.error(
        `[ride alerts] push to ${new URL(subscriptions[index].endpoint).hostname} failed:`,
        reason.statusCode ?? "",
        reason.body ?? reason.message,
      );
    }
  });
  const delivered = results.filter((result) => result.status === "fulfilled").length;
  console.info(
    `[ride alerts] ride ${rideId}: ${delivered}/${subscriptions.length} devices accepted by push services`,
  );

  // 404/410 = the browser dropped this subscription (alerts turned off, site
  // data cleared, app uninstalled) — stop sending to it.
  const expiredIds = results.flatMap((result, index) =>
    result.status === "rejected" &&
    result.reason instanceof WebPushError &&
    (result.reason.statusCode === 404 || result.reason.statusCode === 410)
      ? [subscriptions[index].id]
      : [],
  );
  if (expiredIds.length > 0) {
    await admin.from("push_subscriptions").delete().in("id", expiredIds);
  }
}
