import type { Bit } from "./bip39";
import type { QuantizedOffset } from "./offsetQuantizer";

const DISTANCE_STEP_M = 10;
const ARC_STEP_M = 10;

function intToMinimalBits(n: number): Bit[] {
  if (n <= 0) {
    throw new Error("distanceIndex must be > 0");
  }

  const bits: Bit[] = [];
  while (n > 0) {
    bits.push((n & 1) as Bit);
    n >>= 1;
  }
  bits.reverse();
  return bits;
}

function pushFixedBits(value: number, bitCount: number, out: Bit[]) {
  for (let bit = bitCount - 1; bit >= 0; bit--) {
    out.push(((value >> bit) & 1) as Bit);
  }
}

function readIntFromBits(
  bits: readonly Bit[],
  start: number,
  length: number,
): number {
  let value = 0;
  const end = start + length;
  for (let i = start; i < end; i++) {
    value = (value << 1) | bits[i];
  }
  return value;
}

export function quantizedOffsetToBitsMinimal(q: QuantizedOffset): Bit[] {
  const { distanceIndex, angleIndex } = q;

  if (distanceIndex <= 0) {
    throw new Error("distanceIndex cannot be 0");
  }
  if (angleIndex < 0) {
    throw new Error("angleIndex cannot be negative");
  }

  const distBits = intToMinimalBits(distanceIndex);

  const distanceM = distanceIndex * DISTANCE_STEP_M;
  const circumference = 2 * Math.PI * distanceM;
  const angleSteps = Math.max(1, Math.round(circumference / ARC_STEP_M));
  const angleBitsCount = Math.ceil(Math.log2(angleSteps));

  const bits: Bit[] = [];
  bits.push(...distBits);
  pushFixedBits(angleIndex, angleBitsCount, bits);

  return bits;
}

export function bitsToQuantizedOffset(bits: readonly Bit[]): QuantizedOffset {
  const L = bits.length;
  if (L < 4) {
    throw new Error("Bitstream too short for QuantizedOffset");
  }

  const d = L % 2 === 0 ? 2 : 3;

  const distanceBitsLen = (L - d) / 2;
  const angleBitsLen = distanceBitsLen + d;

  if (!Number.isInteger(distanceBitsLen) || distanceBitsLen <= 0) {
    throw new Error("Invalid bit-length split for QuantizedOffset");
  }

  const distanceIndex = readIntFromBits(bits, 0, distanceBitsLen);
  const angleIndex = readIntFromBits(bits, distanceBitsLen, angleBitsLen);

  if (distanceIndex <= 0) {
    throw new Error("Decoded distanceIndex must be > 0");
  }
  if (angleIndex < 0) {
    throw new Error("Decoded angleIndex must be >= 0");
  }

  const distanceM = distanceIndex * DISTANCE_STEP_M;
  const circumference = 2 * Math.PI * distanceM;
  const angleSteps = Math.max(1, Math.round(circumference / ARC_STEP_M));

  if (angleIndex >= angleSteps) {
    throw new Error(
      "Decoded angleIndex is out of range for this distanceIndex",
    );
  }

  return { distanceIndex, angleIndex };
}
