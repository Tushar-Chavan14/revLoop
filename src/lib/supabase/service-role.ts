import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Bypasses RLS entirely — only for trusted server-to-server contexts (the
// Razorpay webhook) that must write rows no authenticated user's session is
// allowed to write, like flipping a ride_booking to "paid".
export function createServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );
}
