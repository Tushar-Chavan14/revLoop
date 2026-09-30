import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

export type OrganizerDetails = Tables<"organizer_details">;

// cache(): generateMetadata and the page both ask on the same request.
export const getOrganizerDetails = cache(
  async (userId: string): Promise<OrganizerDetails | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("organizer_details")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    return data;
  },
);
