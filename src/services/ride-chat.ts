import { createClient } from "@/lib/supabase/server";
import { RIDE_MESSAGE_SENDER_SELECT } from "@/constants/ride-chat";
import { getMyRideIds } from "@/services/rides";
import type { Database, Tables } from "@/types/supabase";

export type RideMessage = Tables<"ride_messages">;
export type RiderProfile = Pick<
  Tables<"profiles">,
  "id" | "name" | "username" | "profile_image_url"
>;
export type RideMessageWithSender = RideMessage & { sender: RiderProfile | null };

// A flat cap rather than real pagination — fine for a first chat pass since
// ride chats are short-lived (they exist around a single planned ride).
const MESSAGE_HISTORY_LIMIT = 100;

export async function getRideMessages(rideId: string): Promise<RideMessageWithSender[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ride_messages")
    .select(RIDE_MESSAGE_SENDER_SELECT)
    .eq("ride_id", rideId)
    .order("created_at", { ascending: false })
    .limit(MESSAGE_HISTORY_LIMIT);
  return ((data ?? []) as RideMessageWithSender[]).reverse();
}

export interface RecentMessage {
  id: string;
  rideId: string;
  rideTitle: string;
  body: string | null;
  createdAt: string;
  sender: RiderProfile | null;
}

// Latest message across every ride the user belongs to — the dashboard's
// "recent messages" widget, one row per most-recently-active ride.
export async function getRecentMessagesForUser(
  userId: string,
  limit = 5,
): Promise<RecentMessage[]> {
  const rideIds = await getMyRideIds(userId);
  if (rideIds.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("ride_messages")
    .select(
      "id, ride_id, body, created_at, sender:profiles!ride_messages_sender_id_fkey(id, name, username, profile_image_url), ride:rides!ride_messages_ride_id_fkey(title)",
    )
    .in("ride_id", rideIds)
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  const seenRides = new Set<string>();
  const recent: RecentMessage[] = [];
  for (const row of data ?? []) {
    if (seenRides.has(row.ride_id)) {
      continue;
    }
    seenRides.add(row.ride_id);
    const ride = row.ride as { title: string | null } | null;
    recent.push({
      id: row.id,
      rideId: row.ride_id,
      rideTitle: ride?.title ?? "a ride",
      body: row.body,
      createdAt: row.created_at,
      sender: row.sender as RiderProfile | null,
    });
    if (recent.length >= limit) {
      break;
    }
  }
  return recent;
}

type RideChatRow = Database["public"]["Functions"]["get_my_ride_chats"]["Returns"][number];

// The generated RPC types mark every column non-null, but a ride with no
// cover photo or no messages yet comes back with nulls in these.
export type RideChatSummary = Omit<
  RideChatRow,
  | "cover_image_url"
  | "last_message_body"
  | "last_message_at"
  | "last_sender_id"
  | "last_sender_name"
> & {
  cover_image_url: string | null;
  last_message_body: string | null;
  last_message_at: string | null;
  last_sender_id: string | null;
  last_sender_name: string | null;
};

/** Every ride chat the signed-in rider belongs to, most recently active first. */
export async function getMyRideChats(): Promise<RideChatSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_my_ride_chats");
  return (data ?? []) as RideChatSummary[];
}
