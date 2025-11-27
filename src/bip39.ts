import { wordsList } from "./wordsList"

export type Bit = 0 | 1

export function bitsToBip39Words(
  bits: readonly Bit[],
): string[] {
  if (wordsList.length !== 2048) {
    throw new Error("Wordlist must contain exactly 2048 words")
  }
  if (bits.length === 0) {
    throw new Error("Bit sequence must be non-empty")
  }
  if (bits[0] !== 1) {
    throw new Error("Bit sequence must start with 1")
  }

  const L = bits.length
  const rem = L % 11
  const pad = rem === 0 ? 0 : 11 - rem

  const padded: Bit[] = []
  for (let i = 0; i < pad; i++) padded.push(0)
  for (let i = 0; i < bits.length; i++) padded.push(bits[i])

  const result: string[] = []

  for (let i = 0; i < padded.length; i += 11) {
    let index = 0
    for (let j = 0; j < 11; j++) {
      index = (index << 1) | padded[i + j]
    }
    result.push(wordsList[index])
  }

  return result
}

export function bip39WordsToBits(
  words: readonly string[],
): Bit[] {
  if (wordsList.length !== 2048) {
    throw new Error("Wordlist must contain exactly 2048 words")
  }

  const wordToIndex = new Map<string, number>()
  for (let i = 0; i < wordsList.length; i++) {
    wordToIndex.set(wordsList[i], i)
  }

  const bits: Bit[] = []

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const index = wordToIndex.get(word)
    if (index === undefined) {
      throw new Error(`Word "${word}" is not in the wordlist`)
    }

    for (let bit = 10; bit >= 0; bit--) {
      bits.push(((index >> bit) & 1) as Bit)
    }
  }

  let pos = 0
  while (pos < bits.length && bits[pos] === 0) pos++

  if (pos === bits.length) {
    throw new Error("Decoded bit sequence contains no leading 1-bit")
  }

  return bits.slice(pos)
}
