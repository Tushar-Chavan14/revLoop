import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/utils/get-site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const supabase = await createClient();
  const { data: rides } = await supabase
    .from("rides")
    .select("id, updated_at")
    .eq("status", "upcoming")
    .order("updated_at", { ascending: false })
    .limit(500);

  const rideEntries: MetadataRoute.Sitemap = (rides ?? []).map((ride) => ({
    url: `${siteUrl}/rides/${ride.id}`,
    lastModified: new Date(ride.updated_at),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/rides`,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    ...rideEntries,
  ];
}
