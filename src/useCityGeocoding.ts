import { useEffect, useRef, useState } from "react"
import { getCityCoordinates } from "./geonames"
import type { CityCoordinates } from "./geonames";

type CityGeocodingState = {
  coords: CityCoordinates | null
  loading: boolean
  error: string | null
}

export function useCityGeocoding(city: string): CityGeocodingState {
  const [state, setState] = useState<CityGeocodingState>({
    coords: null,
    loading: false,
    error: null
  })

  const debounceRef = useRef<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const trimmed = city.trim()

    if (!trimmed) {
      if (abortRef.current) abortRef.current.abort()
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
      setState({ coords: null, loading: false, error: null })
      return
    }

    if (abortRef.current) abortRef.current.abort()
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)

    const controller = new AbortController()
    abortRef.current = controller

    setState(prev => ({
      coords: prev.coords,
      loading: true,
      error: null
    }))

    debounceRef.current = window.setTimeout(() => {
      getCityCoordinates(trimmed, { signal: controller.signal })
        .then(result => {
          if (controller.signal.aborted) return
          if (!result) {
            setState({
              coords: null,
              loading: false,
              error: `Город "${trimmed}" не найден`
            })
            return
          }
          setState({
            coords: result,
            loading: false,
            error: null
          })
        })
        .catch(err => {
          if (controller.signal.aborted) return
          console.error(err)
          setState({
            coords: null,
            loading: false,
            error: "Ошибка при запросе координат"
          })
        })
    }, 500)

    return () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
      controller.abort()
    }
  }, [city])

  return state
}
