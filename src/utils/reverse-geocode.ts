interface PhotonReverseFeature {
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface PhotonReverseResponse {
  features?: PhotonReverseFeature[];
}

export interface ReverseGeocodeResult {
  name: string;
  city: string | null;
}

const PHOTON_REVERSE_URL = "https://photon.komoot.io/reverse";

// Used when a marker is placed by clicking/dragging on the map (no search
// suggestion to source a label from) — looks up the nearest named place so
// the text field doesn't stay stale relative to the pin.
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult | null> {
  try {
    const url = new URL(PHOTON_REVERSE_URL);
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lang", "en");

    const response = await fetch(url.toString());
    const data: PhotonReverseResponse = await response.json();

    const properties = data.features?.[0]?.properties;
    if (!properties) {
      return null;
    }

    const streetLine = [properties.housenumber, properties.street].filter(Boolean).join(" ");
    const name =
      properties.name || streetLine || properties.city || properties.country || "Dropped pin";
    const city = properties.city || properties.state || properties.country || null;

    return { name, city };
  } catch {
    return null;
  }
}
