export type CityCoordinates = {
  lat: number
  lon: number
  displayName: string
}

export type NearestCity = {
  city: string | null
  displayName: string
  lat: number
  lon: number
}

export type NominatimSearchItem = {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  lat: string
  lon: string
  class: string
  type: string
  place_rank: number
  importance: number
  addresstype?: string
  name?: string
  display_name: string
  boundingbox?: [string, string, string, string]
}

export type NominatimSearchResponse = NominatimSearchItem[]

export type NominatimReverseAddress = {
  city?: string
  town?: string
  village?: string
  hamlet?: string
  city_district?: string
  [key: string]: unknown
}

export type NominatimReverseResponse = {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  lat: string
  lon: string
  class: string
  type: string
  place_rank: number
  importance: number
  addresstype?: string
  name?: string
  display_name: string
  address?: NominatimReverseAddress
  boundingbox?: [string, string, string, string]
}

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org"

const defaultHeaders: HeadersInit = {
  "User-Agent": "your-app-name/0.1 (your-email@example.com)",
  "Accept-Language": "ru"
}

function extractCityName(data: NominatimReverseResponse): string | null {
  if (!data.address) return null
  const a = data.address
  return (
    a.city ||
    a.town ||
    a.village ||
    a.hamlet ||
    null
  )
}

export async function getCityCoordinates(city: string): Promise<CityCoordinates | null> {
  const url = new URL("/search", NOMINATIM_BASE_URL)
  url.searchParams.set("q", city)
  url.searchParams.set("format", "json")
  url.searchParams.set("limit", "1")

  const res = await fetch(url.toString(), {
    headers: defaultHeaders
  })

  if (!res.ok) {
    throw new Error(`Failed to geocode city: ${res.status}`)
  }

  const data = (await res.json()) as NominatimSearchResponse

  if (!Array.isArray(data) || data.length === 0) {
    return null
  }

  const item = data[0]

  return {
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    displayName: item.display_name
  }
}

export async function getNearestCity(lat: number, lon: number): Promise<NearestCity | null> {
  const url = new URL("/reverse", NOMINATIM_BASE_URL)
  url.searchParams.set("lat", String(lat))
  url.searchParams.set("lon", String(lon))
  url.searchParams.set("format", "json")
  url.searchParams.set("zoom", "10")
  url.searchParams.set("addressdetails", "1")

  const res = await fetch(url.toString(), {
    headers: defaultHeaders
  })

  if (!res.ok) {
    throw new Error(`Failed reverse geocoding: ${res.status}`)
  }

  const data = (await res.json()) as NominatimReverseResponse

  const cityName = extractCityName(data)
  if (!cityName) {
    return {
      city: null,
      displayName: data.display_name,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon)
    }
  }

  return {
    city: cityName,
    displayName: data.display_name,
    lat: parseFloat(data.lat),
    lon: parseFloat(data.lon)
  }
}
