"use client";

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";

// Unsplash's CDN (imgix) resizes and picks AVIF/WebP itself, so the browser
// fetches a right-sized frame straight from Unsplash — nothing passes through
// (or counts against the bandwidth of) our own image optimizer.
function unsplashLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 70));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "crop");
  return url.toString();
}

/** next/image for `images.unsplash.com` URLs — pass the bare photo URL, the loader adds sizing. */
export function UnsplashImage({ alt, ...props }: Omit<ImageProps, "loader">) {
  return <Image alt={alt} {...props} loader={unsplashLoader} />;
}
