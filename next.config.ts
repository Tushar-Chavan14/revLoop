import type { NextConfig } from "next";

// /public assets aren't content-hashed, so they get a day of fresh cache plus
// a week of stale-while-revalidate: repeat visits reuse them without even a
// 304 round trip, yet a replaced file still reaches everyone within a day.
const PUBLIC_ASSET_CACHE = "public, max-age=86400, stale-while-revalidate=604800";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  // Let phones on the LAN load dev assets (Next blocks non-localhost origins by default).
  allowedDevOrigins: ["10.47.232.128", "10.47.232.*", "192.168.*.*"],
  images: {
    // AVIF first (~20-30% smaller than WebP), WebP fallback; Netlify's Image
    // CDN / Vercel's optimizer honor this and vary on the Accept header.
    formats: ["image/avif", "image/webp"],
    // Uploaded covers/avatars get a new URL when replaced, so optimized
    // copies can live for a month instead of being re-fetched from Storage.
    minimumCacheTTL: 2678400,
    qualities: [60, 75],
    // Fewer breakpoints = fewer distinct variants to generate and cache.
    deviceSizes: [640, 828, 1080, 1440, 1920],
    imageSizes: [48, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:file(.*\\.(?:svg|jpg|jpeg|png|webp|avif|ico))",
        headers: [{ key: "Cache-Control", value: PUBLIC_ASSET_CACHE }],
      },
      {
        // Ride alerts service worker — never cached, so fixes reach riders
        // on their next visit, and it may only run same-origin scripts.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    // Keep visited pages in the client router cache for 30s, so hopping
    // between nav tabs (and back) is instant instead of a server round trip
    // each time. Server Actions that call refresh()/updateTag() still
    // invalidate it immediately, so a rider always sees their own changes.
    staleTimes: {
      dynamic: 30,
    },
  },
};

export default nextConfig;
