"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createBookingOrder as createRazorpayOrder } from "@/lib/razorpay/client";
import { organizerHasPayoutDetails } from "@/services/organizer-payout";

type ActionResult = { error: string };

const PLATFORM_FEE_RATE = 0.03;

export interface BookingOrderPayload {
  bookingId: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export async function createBookingOrder(
  rideId: string,
): Promise<BookingOrderPayload | ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: ride } = await supabase
    .from("rides")
    .select("id, organizer_id, pricing_model, ride_fee, currency, status, booking_deadline, max_riders")
    .eq("id", rideId)
    .maybeSingle();

  if (!ride || ride.pricing_model !== "organized" || !ride.ride_fee) {
    return { error: "This ride isn't open for booking." };
  }
  if (ride.organizer_id === user.id) {
    return { error: "You're the organizer of this ride." };
  }
  if (ride.status !== "upcoming") {
    return { error: "This ride is no longer open for booking." };
  }
  if (ride.booking_deadline && new Date(ride.booking_deadline) < new Date()) {
    return { error: "The booking deadline for this ride has passed." };
  }

  const { count: memberCount } = await supabase
    .from("ride_members")
    .select("id", { count: "exact", head: true })
    .eq("ride_id", rideId);
  if ((memberCount ?? 0) >= ride.max_riders) {
    return { error: "This ride is already full." };
  }

  const { data: existingBooking } = await supabase
    .from("ride_bookings")
    .select("id, status")
    .eq("ride_id", rideId)
    .eq("rider_id", user.id)
    .in("status", ["created", "paid"])
    .maybeSingle();
  if (existingBooking?.status === "paid") {
    return { error: "You've already booked this ride." };
  }

  if (!(await organizerHasPayoutDetails(ride.organizer_id))) {
    return { error: "This organizer hasn't completed payout setup yet." };
  }

  const amount = Number(ride.ride_fee);
  const platformFeeAmount = Math.round(amount * PLATFORM_FEE_RATE * 100) / 100;
  const organizerAmount = Math.round((amount - platformFeeAmount) * 100) / 100;

  let order;
  try {
    order = await createRazorpayOrder({
      amountRupees: amount,
      currency: ride.currency,
      receipt: `ride_${rideId}_${user.id}`.slice(0, 40),
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return { error: "Couldn't start the payment, please try again." };
  }

  // A prior interrupted attempt (status still "created") is cleared first —
  // the unique index on (ride_id, rider_id) for created/paid bookings would
  // otherwise reject a second row for a fresh order.
  if (existingBooking) {
    await supabase.from("ride_bookings").delete().eq("id", existingBooking.id);
  }

  const { data: booking, error } = await supabase
    .from("ride_bookings")
    .insert({
      ride_id: rideId,
      rider_id: user.id,
      amount,
      platform_fee_amount: platformFeeAmount,
      organizer_amount: organizerAmount,
      currency: ride.currency,
      razorpay_order_id: order.id,
      status: "created",
    })
    .select("id")
    .single();

  if (error || !booking) {
    return { error: "Couldn't start the booking, please try again." };
  }

  return {
    bookingId: booking.id,
    orderId: order.id,
    amount: Number(order.amount),
    currency: ride.currency,
    keyId: process.env.RAZORPAY_KEY_ID!,
  };
}

export async function getBookingStatus(bookingId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ride_bookings")
    .select("status")
    .eq("id", bookingId)
    .maybeSingle();
  return data?.status ?? null;
}
