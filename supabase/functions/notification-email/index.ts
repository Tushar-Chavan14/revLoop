// Deno edge function — invoked by a Supabase Database Webhook (Dashboard:
// Integrations -> Database Webhooks -> table `notifications`, event INSERT,
// type "Supabase Edge Functions") targeting this function. That webhook
// type sends a valid service_role JWT automatically, so this is deployed
// with JWT verification ON (verify_jwt = true in supabase/config.toml) —
// the endpoint isn't publicly invokable. Even so, the webhook payload's
// `record` carries the full row, but we deliberately only read
// `record.id` from it and re-fetch that row from the DB before using
// anything in the email, as defense in depth — never trust email content
// straight from a request body, authenticated or not.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "RoadKin <onboarding@resend.dev>";
const SITE_URL = Deno.env.get("SITE_URL") ?? "http://localhost:3000";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

// This project is on Supabase's new API key format (sb_publishable_.../
// sb_secret_...), where the legacy JWT-based SUPABASE_SERVICE_ROLE_KEY is
// being phased out in favor of SUPABASE_SECRET_KEYS — a JSON dict of named
// secret keys, auto-injected into every Edge Function. Falling back to the
// legacy var keeps this working either way.
function getServiceRoleKey(): string {
  const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeysRaw) {
    try {
      const secretKeys = JSON.parse(secretKeysRaw) as Record<string, string>;
      if (secretKeys.default) {
        return secretKeys.default;
      }
    } catch (error) {
      console.error("Failed to parse SUPABASE_SECRET_KEYS", error);
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

const SERVICE_ROLE_KEY = getServiceRoleKey();

type NotificationType =
  | "ride_join_request"
  | "ride_request_accepted"
  | "ride_request_rejected"
  | "ride_cancelled"
  | "ride_reminder";

interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  ride_id: string | null;
  created_at: string;
}

// Shape of the payload a Supabase Database Webhook (type "Supabase Edge
// Functions") sends. We only trust `record.id` — see the note at the top
// of this file for why the rest of `record` is ignored.
interface DatabaseWebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: { id: string } | null;
  old_record: Record<string, unknown> | null;
}

const SUBJECTS: Record<NotificationType, string> = {
  ride_join_request: "New ride join request",
  ride_request_accepted: "Your ride request was accepted",
  ride_request_rejected: "Your ride request was declined",
  ride_cancelled: "A ride you joined was cancelled",
  ride_reminder: "Upcoming ride reminder",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!RESEND_API_KEY || !SERVICE_ROLE_KEY) {
    console.error("Missing RESEND_API_KEY or Supabase service role key");
    return new Response("Server misconfigured", { status: 500 });
  }

  let payload: DatabaseWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (payload.type !== "INSERT" || payload.table !== "notifications") {
    return new Response("Ignored", { status: 200 });
  }

  const notificationId = payload.record?.id;
  if (!notificationId) {
    return new Response("Missing notification id", { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Re-fetch from the DB rather than trusting the webhook payload for any
  // content — the payload only ever carries the id.
  const { data: notification, error: notificationError } = await supabase
    .from("notifications")
    .select("id, user_id, type, message, ride_id, created_at")
    .eq("id", notificationId)
    .maybeSingle<NotificationRow>();

  if (notificationError || !notification) {
    // Respond 200 so Supabase doesn't keep retrying a row that's gone.
    return new Response("Notification not found", { status: 200 });
  }

  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
    notification.user_id,
  );
  const email = userData?.user?.email;
  if (userError || !email) {
    return new Response("Recipient has no email", { status: 200 });
  }

  const rideUrl = notification.ride_id ? `${SITE_URL}/rides/${notification.ride_id}` : null;
  const subject = SUBJECTS[notification.type] ?? "RoadKin notification";
  const html = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f6; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
            <tr>
              <td style="background-color: #0d0d0d; padding: 28px 32px;" align="center">
                <span style="font-size: 15px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: #ffffff;">
                  Road<span style="color: #e76f24;">Kin</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="background-color: #e76f24; height: 3px; line-height: 3px; font-size: 0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding: 32px 32px 8px 32px;">
                <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #e76f24;">
                  From The Road
                </p>
                <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #161616;">
                  ${escapeHtml(notification.message)}
                </p>
              </td>
            </tr>
            ${
              rideUrl
                ? `<tr>
                    <td style="padding: 0 32px 8px 32px;" align="center">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="border-radius: 10px; background-color: #e76f24;" align="center">
                            <a href="${rideUrl}" style="display: inline-block; padding: 12px 32px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none;">
                              View Ride
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>`
                : ""
            }
            <tr>
              <td style="padding: 24px 32px 32px 32px;">
                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 0 0 16px 0;" />
                <p style="margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #bbbbbb;">
                  RoadKin · Never Ride Alone Again
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `notification-email/${notification.id}`,
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: email,
      subject,
      html,
    }),
  });

  if (!resendResponse.ok) {
    const errorBody = await resendResponse.text();
    console.error("Resend send failed", resendResponse.status, errorBody);
    return new Response("Failed to send email", { status: 502 });
  }

  return new Response("OK", { status: 200 });
});
