export type CityCoordinates = {
  lat: number;
  lon: number;
  displayName: string;
};

export type NearestCity = {
  city: string | null;
  displayName: string;
  lat: number;
  lon: number;
};

export type GeoNamesPlace = {
  geonameId: number;
  name: string;
  lat: string;
  lng: string;
  countryName?: string;
  population?: number;
  fcode?: string;
  fcl?: string;
};

export type GeoNamesSearchResponse = {
  geonames: GeoNamesPlace[];
};

const GEONAMES_BASE_URL = "https://secure.geonames.org";
const GEONAMES_USERNAME = import.meta.env.VITE_GEONAMES_USERNAME;
const LANGUAGE = "en";

const defaultHeaders: HeadersInit = {
  "User-Agent": "your-app-name/0.1 (your-email@example.com)",
  "Accept-Language": LANGUAGE,
};

type RequestOptions = {
  signal?: AbortSignal;
};

export async function getCityCoordinates(
  city: string,
  options?: RequestOptions,
): Promise<CityCoordinates | null> {
  const url = new URL("/searchJSON", GEONAMES_BASE_URL);
  url.searchParams.set("q", city);
  url.searchParams.set("maxRows", "1");
  url.searchParams.set("featureClass", "P");
  url.searchParams.set("lang", LANGUAGE);
  url.searchParams.set("username", GEONAMES_USERNAME);

  const res = await fetch(url.toString(), {
    headers: defaultHeaders,
    signal: options?.signal,
  });

  if (!res.ok) {
    throw new Error(`GeoNames search failed: ${res.status}`);
  }

  const data = (await res.json()) as GeoNamesSearchResponse;

  if (!data.geonames || data.geonames.length === 0) {
    return null;
  }

  const place = data.geonames[0];

  return {
    lat: parseFloat(place.lat),
    lon: parseFloat(place.lng),
    displayName: place.name,
  };
}

export async function getNearestCity(
  lat: number,
  lon: number,
  options?: RequestOptions,
): Promise<NearestCity | null> {
  const url = new URL("/findNearbyPlaceNameJSON", GEONAMES_BASE_URL);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lon));
  url.searchParams.set("maxRows", "1");
  url.searchParams.set("cities", "cities5000");
  url.searchParams.set("lang", LANGUAGE);
  url.searchParams.set("username", GEONAMES_USERNAME);

  const res = await fetch(url.toString(), {
    headers: defaultHeaders,
    signal: options?.signal,
  });

  if (!res.ok) {
    throw new Error(`GeoNames reverse failed: ${res.status}`);
  }

  const data = (await res.json()) as GeoNamesSearchResponse;

  if (!data.geonames || data.geonames.length === 0) {
    return null;
  }

  const place = data.geonames[0];

  return {
    city: place.name || null,
    displayName: place.name,
    lat: parseFloat(place.lat),
    lon: parseFloat(place.lng),
  };
}
