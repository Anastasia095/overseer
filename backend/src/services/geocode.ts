const GEOCODE_URL = "https://geocode.googleapis.com/v4/geocode/location";

interface GeocodeResult {
  formattedAddress?: string;
  addressComponents?: Array<{
    longText: string;
    shortText: string;
    types: string[];
  }>;
}

interface GeocodeResponse {
  results?: GeocodeResult[];
}

function buildLocationLabel(
  response: GeocodeResponse,
): string | null {
  const components = response.results?.[0]?.addressComponents ?? [];

  const city = components.find((c) => c.types.includes("locality"))
    ?? components.find((c) => c.types.includes("administrative_area_level_2"));
  const state = components.find((c) => c.types.includes("administrative_area_level_1"));

  if (city) {
    return state ? `${city.longText}, ${state.shortText}` : city.longText;
  }
  return state?.longText ?? null;
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string | null> {
  const key = process.env.GOOGLE_GEOCODING_API_KEY;
  if (!key) return null;

  const params = new URLSearchParams({
    "location.latitude": `${lat}`,
    "location.longitude": `${lng}`,
    key,
  });

  let res: Response;
  try {
    res = await fetch(`${GEOCODE_URL}?${params.toString()}`);
  } catch {
    return null;
  }
  if (!res.ok) return null;

  let data: GeocodeResponse;
  try {
    data = (await res.json()) as GeocodeResponse;
  } catch {
    return null;
  }

  if (!data.results?.length) return null;
  return buildLocationLabel(data);
}