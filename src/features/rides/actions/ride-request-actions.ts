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

  const { error } = await supabase.from("ride_requests").insert({
    ride_id: rideId,
    requester_id: user.id,
    message: message.trim() || undefined,
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

export async function removeRideMember(memberId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("ride_members").delete().eq("id", memberId);

  if (error) {
    return { error: "You don't have permission to do that" };
  }

  refresh();
}
