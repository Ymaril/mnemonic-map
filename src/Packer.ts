import { wordsList } from "./wordsList";

export function bytesToBip39Words(
  bytes: Uint8Array,
  wordlist: readonly string[],
): string[] {
  if (wordlist.length !== 2048) {
    throw new Error("Wordlist must contain exactly 2048 words");
  }

  const result: string[] = [];
  let buffer = 0;
  let bitsInBuffer = 0;

  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    buffer = (buffer << 8) | byte;
    bitsInBuffer += 8;

    while (bitsInBuffer >= 11) {
      const shift = bitsInBuffer - 11;
      const index = buffer >> shift;
      result.push(wordlist[index]);
      const mask = (1 << shift) - 1;
      buffer = buffer & mask;
      bitsInBuffer -= 11;
    }
  }

  if (bitsInBuffer > 0) {
    const index = buffer << (11 - bitsInBuffer);
    result.push(wordlist[index]);
  }

  return result;
}

export function bip39WordsToBytes(words: readonly string[]): Uint8Array {
  if (wordsList.length !== 2048) {
    throw new Error("Wordlist must contain exactly 2048 words");
  }

  const wordToIndex = new Map<string, number>();
  for (let i = 0; i < wordsList.length; i++) {
    wordToIndex.set(wordsList[i], i);
  }

  let buffer = 0;
  let bitsInBuffer = 0;
  const bytes: number[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const index = wordToIndex.get(word);
    if (index === undefined) {
      throw new Error(`Word "${word}" is not in the wordlist`);
    }

    buffer = (buffer << 11) | index;
    bitsInBuffer += 11;

    while (bitsInBuffer >= 8) {
      const shift = bitsInBuffer - 8;
      const byte = (buffer >> shift) & 0xff;
      bytes.push(byte);
      const mask = (1 << shift) - 1;
      buffer = buffer & mask;
      bitsInBuffer -= 8;
    }
  }

  return new Uint8Array(bytes);
}
