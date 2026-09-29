import type { MetadataRoute } from "next";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/constants/site";

// Makes RoadKin installable to the Home Screen — which iPhone requires before
// it will deliver ride alerts at all.
export default function manifest(): MetadataRoute.Manifest {
  return {
    // Stable identity for the installed app, so a future start_url change
    // doesn't make browsers treat it as a different app.
    id: "/",
    name: APP_NAME + "-" + APP_TAGLINE,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0d0d0d",
    theme_color: "#0d0d0d",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
