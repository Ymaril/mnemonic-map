import type { PolarOffset } from "./offset"

export type QuantizedOffset = {
  distanceIndex: number
  angleIndex: number
}

const QUANTIZATION_CONFIG = {
  distanceStepM: 10,
  arcStepM: 10,
}


function normalizeAngleRad(angle: number): number {
  const twoPi = 2 * Math.PI
  let r = angle % twoPi
  if (r < 0) r += twoPi
  return r
}

export function quantizeOffset(
  offset: PolarOffset
): QuantizedOffset {
  const { distanceM, bearingRad } = offset
  const { distanceStepM, arcStepM } = QUANTIZATION_CONFIG

  const clampedDistance = Math.min(Math.max(distanceM, 0), Infinity)
  const distanceIndex = Math.round(clampedDistance / distanceStepM)
  const quantizedDistanceM = distanceIndex * distanceStepM

  if (quantizedDistanceM === 0) {
    return {
      distanceIndex: 0,
      angleIndex: 0,
    }
  }

  const circumference = 2 * Math.PI * quantizedDistanceM
  const angleSteps = Math.max(1, Math.round(circumference / arcStepM))
  const stepAngleRad = (2 * Math.PI) / angleSteps

  const normalizedBearing = normalizeAngleRad(bearingRad)
  let angleIndex = Math.round(normalizedBearing / stepAngleRad)
  angleIndex = ((angleIndex % angleSteps) + angleSteps) % angleSteps

  return {
    distanceIndex,
    angleIndex,
  }
}

export function dequantizeOffset(
  qo: QuantizedOffset
): PolarOffset {
  const { distanceStepM, arcStepM } = QUANTIZATION_CONFIG
  const safeDistanceIndex = Math.max(0, qo.distanceIndex)

  const distanceM = safeDistanceIndex * distanceStepM

  if (distanceM === 0) {
    return {
      distanceM: 0,
      bearingRad: 0,
    }
  }

  const circumference = 2 * Math.PI * distanceM
  const angleSteps = Math.max(1, Math.round(circumference / arcStepM))
  const stepAngleRad = (2 * Math.PI) / angleSteps

  const safeAngleIndex =
    ((qo.angleIndex % angleSteps) + angleSteps) % angleSteps

  const bearingRad = safeAngleIndex * stepAngleRad

  return {
    distanceM,
    bearingRad,
  }
}
