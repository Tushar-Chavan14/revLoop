"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string } | void;

const UNIQUE_VIOLATION = "23505";

export async function requestToJoinRide(rideId: string, message: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const trimmedMessage = message.trim() || null;

  // A rider can only ever have one ride_requests row per ride (unique
  // ride_id+requester_id) — re-requesting after a decline/cancellation/removal
  // means updating that same row back to pending, not inserting a new one.
  const { data: existing } = await supabase
    .from("ride_requests")
    .select("id, status")
    .eq("ride_id", rideId)
    .eq("requester_id", user.id)
    .maybeSingle();

  if (existing) {
    if (existing.status === "pending") {
      return { error: "You already have a pending request for this ride." };
    }
    if (existing.status === "accepted") {
      return { error: "You're already part of this ride." };
    }

    const { error } = await supabase
      .from("ride_requests")
      .update({ status: "pending", message: trimmedMessage })
      .eq("id", existing.id);
    if (error) {
      return { error: error.message };
    }
    refresh();
    return;
  }

  const { error } = await supabase.from("ride_requests").insert({
    ride_id: rideId,
    requester_id: user.id,
    message: trimmedMessage,
  });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { error: "You've already requested to join this ride." };
    }
    return { error: "Couldn't send your request, please try again" };
  }

  refresh();
}

export async function cancelJoinRequest(requestId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ride_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  refresh();
}

export async function respondToJoinRequest(
  requestId: string,
  action: "accept" | "reject",
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ride_requests")
    .update({ status: action === "accept" ? "accepted" : "rejected" })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  refresh();
}

export async function removeRideMember(rideId: string, userId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ride_members")
    .delete()
    .eq("ride_id", rideId)
    .eq("user_id", userId);

  if (error) {
    return { error: "You don't have permission to do that" };
  }

  // The membership is gone, but its originating request would otherwise sit
  // at "accepted" forever, permanently blocking a future re-request (only
  // pending/accepted rows are blocked from re-requesting). Reopen the door.
  await supabase
    .from("ride_requests")
    .update({ status: "cancelled" })
    .eq("ride_id", rideId)
    .eq("requester_id", userId)
    .eq("status", "accepted");

  refresh();
}

export async function setAttendance(
  rideId: string,
  userId: string,
  status: "attended" | "no_show" | "pending",
): Promise<ActionResult> {
  const supabase = await createClient();
  // RLS + the ride_members_before_update_guard trigger enforce that only the
  // ride's organizer can do this, and only once the ride's departure time
  // has passed — this is just the client-facing call.
  const { error } = await supabase
    .from("ride_members")
    .update({ attendance_status: status })
    .eq("ride_id", rideId)
    .eq("user_id", userId);

  if (error) {
    return { error: "Couldn't update attendance, please try again" };
  }

  refresh();
}
