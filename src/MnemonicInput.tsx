import { wordsList } from "./wordsList"
import type { ChangeEvent } from "react"
import { useEffect, useMemo } from "react"

type MnemonicInputProps = {
  value: string
  onChange: (value: string) => void
  onValidChange?: (value: string, city: string, words: string[]) => void
}

export function MnemonicInput({ value, onChange, onValidChange }: MnemonicInputProps) {
  const dictionary = useMemo(
    () => new Set(wordsList.map(w => w.toLowerCase())),
    []
  )

  function validateMnemonic(input: string) {
    const parts = input.trim().split(/\s+/).filter(Boolean)
    if (parts.length < 2) return null
    const [city, ...words] = parts
    if (!city) return null
    const allValid = words.every(w => dictionary.has(w.toLowerCase()))
    if (!allValid) return null
    return { city, words }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value)
  }

  useEffect(() => {
    if (!onValidChange) return
    const result = validateMnemonic(value)
    if (!result) return
    onValidChange(value, result.city, result.words)
  }, [value, onValidChange])

  return (
    <input
      style={{ width: "40rem", marginBottom: "2rem" }}
      value={value}
      onChange={handleChange}
    />
  )
}
