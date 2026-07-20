"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/services/roles";

type ActionResult = { error?: string } | void;

export async function markBookingsSettled(bookingIds: string[]): Promise<ActionResult> {
  if (!(await isCurrentUserAdmin())) {
    redirect("/");
  }
  if (bookingIds.length === 0) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("ride_bookings")
    .update({ settled_at: new Date().toISOString() })
    .in("id", bookingIds);

  if (error) {
    return { error: "Couldn't mark as settled, please try again." };
  }

  refresh();
}
