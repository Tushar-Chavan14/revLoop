import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_SUPABASE_URL!,
    process.env.NEXT_SUPABASE_PUBLISHABLE_KEY!,
  );
}
