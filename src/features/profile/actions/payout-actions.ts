"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string } | void;

export async function savePayoutDetails(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const payoutMethod = String(formData.get("payoutMethod") ?? "");
  if (payoutMethod !== "upi" && payoutMethod !== "bank") {
    return { error: "Select a payout method." };
  }

  const upiId = (formData.get("upiId") as string)?.trim() || undefined;
  const bankAccountNumber = (formData.get("bankAccountNumber") as string)?.trim() || undefined;
  const bankIfsc = (formData.get("bankIfsc") as string)?.trim() || undefined;
  const bankAccountName = (formData.get("bankAccountName") as string)?.trim() || undefined;

  if (payoutMethod === "upi" && !upiId) {
    return { error: "Enter a UPI ID." };
  }
  if (payoutMethod === "bank" && (!bankAccountNumber || !bankIfsc || !bankAccountName)) {
    return { error: "Fill in all bank account fields." };
  }

  const { error } = await supabase.from("organizer_payout_details").upsert(
    {
      user_id: user.id,
      payout_method: payoutMethod,
      upi_id: payoutMethod === "upi" ? upiId : null,
      bank_account_number: payoutMethod === "bank" ? bankAccountNumber : null,
      bank_ifsc: payoutMethod === "bank" ? bankIfsc : null,
      bank_account_name: payoutMethod === "bank" ? bankAccountName : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { error: "Couldn't save payout details, please try again." };
  }

  refresh();
}
