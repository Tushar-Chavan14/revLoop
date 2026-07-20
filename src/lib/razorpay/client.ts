import Razorpay from "razorpay";

let client: Razorpay | null = null;

export function getRazorpayClient() {
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return client;
}

interface CreateBookingOrderInput {
  amountRupees: number;
  currency: string;
  receipt: string;
}

// The whole fee goes to the platform's single Razorpay account — no Route
// split. The organizer's share (minus the platform's 3% cut) is settled
// manually later, tracked via ride_bookings.settled_at.
export async function createBookingOrder(input: CreateBookingOrderInput) {
  const razorpay = getRazorpayClient();
  return razorpay.orders.create({
    amount: Math.round(input.amountRupees * 100),
    currency: input.currency,
    receipt: input.receipt,
  });
}

export function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  return Razorpay.validateWebhookSignature(rawBody, signature, secret);
}
