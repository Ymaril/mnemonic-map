import { useEffect, useRef, useState } from "react"
import type { LatLngLiteral } from "leaflet"
import { getNearestCity, type NearestCity } from "./geonames"

type NearestCityState = {
  city: NearestCity | null
  loading: boolean
  error: string | null
}

export function useNearestCity(point: LatLngLiteral | null): NearestCityState {
  const [state, setState] = useState<NearestCityState>({
    city: null,
    loading: false,
    error: null,
  })

  const debounceRef = useRef<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!point) {
      if (abortRef.current) abortRef.current.abort()
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
      setState({ city: null, loading: false, error: null })
      return
    }

    if (abortRef.current) abortRef.current.abort()
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)

    const controller = new AbortController()
    abortRef.current = controller

    setState(prev => ({
      city: prev.city,
      loading: true,
      error: null,
    }))

    const { lat, lng } = point

    debounceRef.current = window.setTimeout(() => {
      getNearestCity(lat, lng, { signal: controller.signal })
        .then(result => {
          if (controller.signal.aborted) return
          if (!result) {
            setState({
              city: null,
              loading: false,
              error: "Город по этим координатам не найден",
            })
            return
          }
          setState({
            city: result,
            loading: false,
            error: null,
          })
        })
        .catch(err => {
          if (controller.signal.aborted) return
          console.error(err)
          setState({
            city: null,
            loading: false,
            error: "Ошибка при обратном геокодинге",
          })
        })
    }, 500)

    return () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
      controller.abort()
    }
  }, [point?.lat, point?.lng])

  return state
}
