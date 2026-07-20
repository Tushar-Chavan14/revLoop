import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay/client";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

// Cross-checking Razorpay's docs didn't converge on a single definitive event
// name for the order+transfers flow, so any of these is treated as "payment
// succeeded" — the booking lookup below is idempotent regardless of which
// fires (or if more than one does).
const PAYMENT_SUCCESS_EVENTS = new Set(["payment.captured", "order.paid", "payment.authorized"]);

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !secret || !verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  if (!PAYMENT_SUCCESS_EVENTS.has(event.event)) {
    return NextResponse.json({ received: true });
  }

  const paymentEntity = event.payload?.payment?.entity;
  const orderId: string | undefined = paymentEntity?.order_id;
  const paymentId: string | undefined = paymentEntity?.id;
  if (!orderId) {
    return NextResponse.json({ received: true });
  }

  const supabase = createServiceRoleClient();

  const { data: booking } = await supabase
    .from("ride_bookings")
    .select("id, status")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();

  if (!booking || booking.status === "paid") {
    return NextResponse.json({ received: true });
  }

  const { error } = await supabase
    .from("ride_bookings")
    .update({
      status: "paid",
      razorpay_payment_id: paymentId,
      paid_at: new Date().toISOString(),
    })
    .eq("id", booking.id)
    .eq("status", "created");

  if (error) {
    // Most likely the capacity-check trigger raised (ride filled up in the
    // race between checkout starting and this webhook arriving). The payment
    // was already captured by Razorpay, so this is a known edge case that
    // needs a manual refund — mark the booking failed rather than leaving it
    // stuck at "created".
    await supabase.from("ride_bookings").update({ status: "failed" }).eq("id", booking.id);
  }

  return NextResponse.json({ received: true });
}
