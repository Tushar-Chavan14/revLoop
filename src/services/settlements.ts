import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

export type PayoutDetails = Tables<"organizer_payout_details">;

export interface SettlementBooking {
  id: string;
  amount: number;
  platform_fee_amount: number;
  organizer_amount: number;
  currency: string;
  paid_at: string | null;
  settled_at: string | null;
  rideId: string;
  rideTitle: string;
  organizerId: string;
  organizerName: string;
  riderName: string;
}

export interface OrganizerSettlementGroup {
  organizerId: string;
  organizerName: string;
  payoutDetails: PayoutDetails | null;
  bookings: SettlementBooking[];
  totalOwed: number;
}

// Requires the caller to be an admin (backed by RLS: only admins may see any
// row other than their own on ride_bookings/organizer_payout_details).
export async function getSettlementGroups(): Promise<OrganizerSettlementGroup[]> {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("ride_bookings")
    .select(
      "id, amount, platform_fee_amount, organizer_amount, currency, paid_at, settled_at, ride_id, rider_id, ride:rides(id, title, organizer_id)",
    )
    .eq("status", "paid")
    .is("settled_at", null)
    .order("paid_at", { ascending: true });

  if (!bookings || bookings.length === 0) {
    return [];
  }

  const organizerIds = [...new Set(bookings.map((b) => b.ride?.organizer_id).filter(Boolean))] as string[];
  const riderIds = [...new Set(bookings.map((b) => b.rider_id))];
  const profileIds = [...new Set([...organizerIds, ...riderIds])];

  const [{ data: profiles }, { data: payoutDetails }] = await Promise.all([
    supabase.from("profiles").select("id, name").in("id", profileIds),
    supabase.from("organizer_payout_details").select("*").in("user_id", organizerIds),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p.name]));
  const payoutByOrganizer = new Map((payoutDetails ?? []).map((p) => [p.user_id, p]));

  const groups = new Map<string, OrganizerSettlementGroup>();
  for (const booking of bookings) {
    const organizerId = booking.ride?.organizer_id;
    if (!organizerId) continue;

    if (!groups.has(organizerId)) {
      groups.set(organizerId, {
        organizerId,
        organizerName: profileById.get(organizerId) ?? "Unknown",
        payoutDetails: payoutByOrganizer.get(organizerId) ?? null,
        bookings: [],
        totalOwed: 0,
      });
    }

    const group = groups.get(organizerId)!;
    group.bookings.push({
      id: booking.id,
      amount: Number(booking.amount),
      platform_fee_amount: Number(booking.platform_fee_amount),
      organizer_amount: Number(booking.organizer_amount),
      currency: booking.currency,
      paid_at: booking.paid_at,
      settled_at: booking.settled_at,
      rideId: booking.ride_id,
      rideTitle: booking.ride?.title ?? "Untitled ride",
      organizerId,
      organizerName: profileById.get(organizerId) ?? "Unknown",
      riderName: profileById.get(booking.rider_id) ?? "Unknown",
    });
    group.totalOwed += Number(booking.organizer_amount);
  }

  return [...groups.values()];
}
