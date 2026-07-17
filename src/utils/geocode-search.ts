// Photon (komoot) is a free, keyless geocoder built on OpenStreetMap data,
// purpose-built for autocomplete. Nominatim (tried first) only matches whole
// words — "jap" never suggests "Japan" there — which makes it unusable for
// type-ahead. Photon handles prefixes correctly while staying on the same
// open-data stack. Shared between LocationAutocomplete (ride form fields)
// and CityPicker (discovery page) so both search places the same way.
const PHOTON_URL = "https://photon.komoot.io/api/";

export type LocationType = "place" | "country" | "address";

const OSM_TAG: Partial<Record<LocationType, string>> = {
  place: "place",
  country: "place:country",
  // "address" is intentionally unfiltered: it should match places, streets,
  // and POIs alike (e.g. "CCD Hinjewadi, Pune").
};

export interface LocationSuggestion {
  id: string;
  name: string;
  displayName: string;
  city: string | null;
  country: string | null;
  lat: number;
  lng: number;
}

interface PhotonFeature {
  properties: {
    osm_id: number;
    osm_type?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    country?: string;
    countrycode?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface PhotonResponse {
  features?: PhotonFeature[];
}

function buildName(properties: PhotonFeature["properties"]) {
  if (properties.name) {
    return properties.name;
  }
  const streetLine = [properties.housenumber, properties.street].filter(Boolean).join(" ");
  return streetLine || properties.city || properties.country || "Unnamed location";
}

function buildDisplayName(properties: PhotonFeature["properties"]) {
  return [properties.city, properties.state, properties.country].filter(Boolean).join(", ");
}

function buildCity(properties: PhotonFeature["properties"]) {
  return properties.city || properties.state || properties.country || null;
}

export interface SearchPlacesOptions {
  limit?: number;
  /** ISO 3166-1 alpha-2 code (e.g. "IN") — restricts results to that country. */
  countryCode?: string;
}

export async function searchPlaces(
  query: string,
  type: LocationType,
  options: SearchPlacesOptions = {},
): Promise<LocationSuggestion[]> {
  const limit = options.limit ?? 6;
  // When filtering to a country, over-fetch first — Photon's relevance
  // ranking often surfaces same/similar-named places from other countries
  // ahead of the one we actually want, so a plain `limit` fetch can filter
  // down to nothing.
  const fetchLimit = options.countryCode ? Math.max(limit * 4, 20) : limit;

  const url = new URL(PHOTON_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("lang", "en");
  url.searchParams.set("limit", String(fetchLimit));
  const osmTag = OSM_TAG[type];
  if (osmTag) {
    url.searchParams.set("osm_tag", osmTag);
  }

  const response = await fetch(url.toString());
  const data: PhotonResponse = await response.json();

  const features = options.countryCode
    ? (data.features ?? []).filter(
        (feature) => feature.properties.countrycode === options.countryCode,
      )
    : (data.features ?? []);

  return features.slice(0, limit).map((feature, index) => ({
    // osm_id alone isn't unique — node/way/relation are separate ID
    // namespaces in OSM, so two different features can share a number.
    // osm_type disambiguates that; the index is a final safety net.
    id: `${feature.properties.osm_type ?? "unknown"}-${feature.properties.osm_id}-${index}`,
    name: buildName(feature.properties),
    displayName: buildDisplayName(feature.properties),
    city: buildCity(feature.properties),
    country: feature.properties.country || null,
    lng: feature.geometry.coordinates[0],
    lat: feature.geometry.coordinates[1],
  }));
}
