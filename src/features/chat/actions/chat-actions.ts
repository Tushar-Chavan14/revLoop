"use server";

import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { isAllowedPushEndpoint, sendRideChatAlerts } from "@/lib/web-push";
import { RIDE_MESSAGE_SENDER_SELECT } from "@/constants/ride-chat";
import type { RideMessageWithSender } from "@/services/ride-chat";

const MAX_MESSAGE_LENGTH = 2000;

type SendResult = { message: RideMessageWithSender } | { error: string };

export async function sendRideMessage(rideId: string, body: string): Promise<SendResult> {
  const trimmed = body.trim();
  if (!trimmed) {
    return { error: "Write something first." };
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { error: "That message is too long — try splitting it up." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sign in to message your crew." };
  }

  // RLS only lets ride members post, so no separate membership check here.
  const { data, error } = await supabase
    .from("ride_messages")
    .insert({ ride_id: rideId, sender_id: user.id, body: trimmed })
    .select(RIDE_MESSAGE_SENDER_SELECT)
    .single();
  if (error || !data) {
    return { error: "Couldn't send your message, please try again" };
  }

  const message = data as RideMessageWithSender;
  after(() =>
    sendRideChatAlerts({
      rideId,
      senderId: user.id,
      senderName: message.sender?.name ?? null,
      body: trimmed,
    }),
  );

  return { message };
}

interface BrowserAlertSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function saveRideAlertSubscription(
  subscription: BrowserAlertSubscription,
  userAgent: string | null,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sign in to turn on ride alerts." };
  }

  const { endpoint, keys } = subscription;
  if (!isAllowedPushEndpoint(endpoint) || !keys?.p256dh || !keys?.auth) {
    return { error: "This browser can't receive ride alerts." };
  }

  // Service role so a shared browser that switches accounts moves its
  // endpoint to whoever is signed in now, instead of failing on the unique
  // endpoint owned by the previous account.
  const admin = createServiceRoleClient();
  const { error } = await admin.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      user_agent: userAgent?.slice(0, 300) ?? null,
    },
    { onConflict: "endpoint" },
  );
  if (error) {
    return { error: "Couldn't turn on ride alerts, please try again." };
  }
  return {};
}

export async function removeRideAlertSubscription(endpoint: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
}
