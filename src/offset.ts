export type GeoPoint = {
  lat: number
  lon: number
}

export type PolarOffset = {
  distanceM: number
  bearingRad: number
}

const EARTH_RADIUS_M = 6371000

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

function normalizeAngleRad(angle: number): number {
  const twoPi = 2 * Math.PI
  let r = angle % twoPi
  if (r < 0) r += twoPi
  return r
}

export function getOffset(origin: GeoPoint, target: GeoPoint): PolarOffset {
  const φ1 = degToRad(origin.lat)
  const λ1 = degToRad(origin.lon)
  const φ2 = degToRad(target.lat)
  const λ2 = degToRad(target.lon)

  const dφ = φ2 - φ1
  const dλ = λ2 - λ1

  const sinDφ2 = Math.sin(dφ / 2)
  const sinDλ2 = Math.sin(dλ / 2)

  const a =
    sinDφ2 * sinDφ2 +
    Math.cos(φ1) * Math.cos(φ2) * sinDλ2 * sinDλ2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distanceM = EARTH_RADIUS_M * c

  const y = Math.sin(dλ) * Math.cos(φ2)
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(dλ)

  const bearingRad = normalizeAngleRad(Math.atan2(y, x))

  return { distanceM, bearingRad }
}

export function moveFrom(origin: GeoPoint, offset: PolarOffset): GeoPoint {
  const { distanceM, bearingRad } = offset
  const δ = distanceM / EARTH_RADIUS_M

  const φ1 = degToRad(origin.lat)
  const λ1 = degToRad(origin.lon)

  const sinφ1 = Math.sin(φ1)
  const cosφ1 = Math.cos(φ1)
  const sinδ = Math.sin(δ)
  const cosδ = Math.cos(δ)

  const sinφ2 = sinφ1 * cosδ + cosφ1 * sinδ * Math.cos(bearingRad)
  const φ2 = Math.asin(sinφ2)

  const y = Math.sin(bearingRad) * sinδ * cosφ1
  const x = cosδ - sinφ1 * sinφ2
  const λ2 = λ1 + Math.atan2(y, x)

  const lat = radToDeg(φ2)
  let lon = radToDeg(λ2)

  if (lon > 180) lon -= 360
  if (lon < -180) lon += 360

  return { lat, lon }
}
