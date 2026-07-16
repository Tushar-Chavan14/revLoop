import { haversineKm } from "@/utils/geo";

interface CommonsImageInfo {
  imageinfo?: { thumburl?: string }[];
}

interface CommonsGeosearchResponse {
  query?: {
    pages?: Record<string, CommonsImageInfo>;
  };
}

interface WikipediaSummary {
  type: string;
  coordinates?: { lat: number; lon: number } | null;
  thumbnail?: { source: string };
  originalimage?: { source: string };
}

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const WIKIPEDIA_SUMMARY_API = "https://en.wikipedia.org/api/rest_v1/page/summary";
// A descriptive UA is part of Wikimedia's API etiquette (unlabeled traffic risks being blocked).
const USER_AGENT = "RevLoop/1.0 (https://revloop.app; motorcycle riding community app)";
// A wrong-topic match (e.g. a film or person sharing the destination's name)
// won't have coordinates anywhere near the real place — reject anything
// further than this away instead of risking an unrelated photo.
const MAX_MATCH_DISTANCE_KM = 60;
const CACHE_OPTIONS = { next: { revalidate: 60 * 60 * 24 * 30 } }; // real-world geography doesn't change

// Wikimedia's static thumb URLs only serve a fixed whitelist of widths — this
// re-resolves a File: page through the API instead, which can render any width.
async function resolveCommonsThumb(imageUrl: string, width = 1200): Promise<string | null> {
  const filename = decodeURIComponent(imageUrl.split("/").pop() ?? "");
  if (!filename) {
    return null;
  }

  const params = new URLSearchParams({
    action: "query",
    titles: `File:${filename}`,
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: String(width),
    format: "json",
  });

  try {
    const response = await fetch(`${COMMONS_API}?${params.toString()}`, {
      headers: { "User-Agent": USER_AGENT },
      ...CACHE_OPTIONS,
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as CommonsGeosearchResponse;
    const pages = Object.values(data.query?.pages ?? {});
    return pages[0]?.imageinfo?.[0]?.thumburl ?? null;
  } catch {
    return null;
  }
}

/**
 * The place's actual Wikipedia lead photo — generally the single most
 * representative/"iconic" image of it, rather than an arbitrary nearby
 * snapshot. Looked up by name, then rejected unless the article's own
 * coordinates land near where this destination actually is — a short/generic
 * name (e.g. a neighborhood called "Sector 36") can just as easily resolve to
 * an unrelated film or person, and this is what catches that.
 */
export async function getWikipediaPlacePhoto(
  placeName: string,
  nearLat: number,
  nearLng: number,
): Promise<string | null> {
  try {
    const response = await fetch(`${WIKIPEDIA_SUMMARY_API}/${encodeURIComponent(placeName)}`, {
      headers: { "User-Agent": USER_AGENT },
      ...CACHE_OPTIONS,
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as WikipediaSummary;
    if (data.type !== "standard" || !data.coordinates) {
      return null;
    }
    if (
      haversineKm(nearLat, nearLng, data.coordinates.lat, data.coordinates.lon) >
      MAX_MATCH_DISTANCE_KM
    ) {
      return null;
    }

    const imageUrl = data.originalimage?.source ?? data.thumbnail?.source;
    if (!imageUrl) {
      return null;
    }
    return (await resolveCommonsThumb(imageUrl)) ?? imageUrl;
  } catch {
    return null;
  }
}

/**
 * A real, freely-licensed photo actually taken near these coordinates —
 * Wikimedia Commons' geosearch, restricted to the File namespace. Less
 * "canonical" than getWikipediaPlacePhoto (could be any geotagged snapshot,
 * not necessarily a good one) but works for places with no Wikipedia article.
 */
export async function getNearbyCommonsPhoto(
  lat: number,
  lng: number,
  radiusMeters = 10_000,
): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    generator: "geosearch",
    ggscoord: `${lat}|${lng}`,
    ggsradius: String(radiusMeters),
    ggsnamespace: "6",
    ggslimit: "1",
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "1200",
    format: "json",
  });

  try {
    const response = await fetch(`${COMMONS_API}?${params.toString()}`, {
      headers: { "User-Agent": USER_AGENT },
      ...CACHE_OPTIONS,
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as CommonsGeosearchResponse;
    const pages = Object.values(data.query?.pages ?? {});
    return pages[0]?.imageinfo?.[0]?.thumburl ?? null;
  } catch {
    return null;
  }
}

/**
 * Best-available real photo for a destination: the place's own Wikipedia
 * lead image where one genuinely matches, otherwise any real photo
 * geotagged nearby. Caller should fall back to a themed placeholder on null.
 */
export async function getDestinationPhoto(
  placeName: string,
  lat: number,
  lng: number,
): Promise<string | null> {
  const wikipediaPhoto = await getWikipediaPlacePhoto(placeName, lat, lng);
  if (wikipediaPhoto) {
    return wikipediaPhoto;
  }
  return getNearbyCommonsPhoto(lat, lng);
}
