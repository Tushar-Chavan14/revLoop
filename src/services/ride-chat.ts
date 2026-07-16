import { createClient } from "@/lib/supabase/server";
import { RIDE_MESSAGE_SENDER_SELECT } from "@/constants/ride-chat";
import type { Tables } from "@/types/supabase";

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
