import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

export type OrganizerPayoutDetails = Tables<"organizer_payout_details">;

export async function getPayoutDetails(userId: string): Promise<OrganizerPayoutDetails | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizer_payout_details")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export function hasPayoutDetails(details: OrganizerPayoutDetails | null): boolean {
  return details !== null;
}

// For checking someone ELSE's payout setup (e.g. a rider checking the
// organizer's) — RLS rightly blocks reading another user's payout row
// directly, so this goes through a SECURITY DEFINER function that only
// answers yes/no, never exposing the bank/UPI details themselves.
export async function organizerHasPayoutDetails(organizerId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("has_payout_details", { uid: organizerId });
  return data ?? false;
}
