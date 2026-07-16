import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/utils/get-site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Auth-gated or user-specific pages — no value in the index.
      disallow: ["/profile", "/rides/create", "/auth/", "/login"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
