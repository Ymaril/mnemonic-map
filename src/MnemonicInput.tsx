import { wordsList } from "./wordsList";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";

export type Mnemonic = {
  full: string;
  city: string;
  words: string[];
};

type MnemonicInputProps = {
  value: Mnemonic | null;
  onChange: (value: Mnemonic | null) => void;
};

export function MnemonicInput({ value, onChange }: MnemonicInputProps) {
  const dictionary = useMemo(
    () => new Set(wordsList.map((w) => w.toLowerCase())),
    [],
  );

  const [inputValue, setInputValue] = useState<string>(value?.full ?? "");

  useEffect(() => {
    const next = value?.full ?? "";
    setInputValue((prev) => (prev === next ? prev : next));
  }, [value]);

  function validateMnemonic(input: string) {
    const parts = input.trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) return null;
    const [city, ...words] = parts;
    if (!city) return null;
    const allValid = words.every((w) => dictionary.has(w.toLowerCase()));
    if (!allValid) return null;
    return { city, words };
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setInputValue(raw);

    const parsed = validateMnemonic(raw);
    if (!parsed) {
      return;
    }

    const full = raw.trim();

    if (
      value &&
      value.full === full &&
      value.city === parsed.city &&
      value.words.length === parsed.words.length &&
      value.words.every((w, i) => w === parsed.words[i])
    ) {
      return;
    }

    onChange({
      full,
      city: parsed.city,
      words: parsed.words,
    });
  }

  return (
    <input
      style={{ width: "40rem", marginBottom: "2rem" }}
      value={inputValue}
      onChange={handleChange}
    />
  );
}
