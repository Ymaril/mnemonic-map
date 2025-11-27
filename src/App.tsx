import { useEffect, useState } from "react"
import "./App.css"
import "leaflet/dist/leaflet.css"
import { Map } from "./Map"
import type { LatLngLiteral } from "leaflet"
import { MnemonicInput, type Mnemonic } from "./MnemonicInput"
import { useCityGeocoding } from "./useCityGeocoding"
import { useNearestCity } from "./useNearestCity"

type PointSource = "user" | "city" | null

function App() {
  const [count, setCount] = useState(0)
  const [point, setPoint] = useState<LatLngLiteral>({ lat: 51.505, lng: -0.09 })
  const [mnemonic, setMnemonic] = useState<Mnemonic | null>(null)
  const [pointSource, setPointSource] = useState<PointSource>(null)

  const city = mnemonic?.city ?? ""

  const {
    coords: cityCoords,
    loading: cityLoading,
    error: cityError,
  } = useCityGeocoding(city)

  const {
    city: nearestCity,
    loading: nearestLoading,
    error: nearestError,
  } = useNearestCity(pointSource === "user" ? point : null)

  useEffect(() => {
    if (cityCoords) {
      setPointSource("city")
      setPoint({ lat: cityCoords.lat, lng: cityCoords.lon })
    }
  }, [cityCoords])

  useEffect(() => {
    if (!nearestCity) return
    if (!nearestCity.city) return
    if (pointSource !== "user") return

    setMnemonic(prev => {
      if (!prev) {
        return {
          full: nearestCity.city,
          city: nearestCity.city,
          words: [],
        }
      }

      if (prev.city === nearestCity.city) {
        return prev
      }

      const full = [nearestCity.city, ...prev.words].join(" ").trim()

      return {
        full,
        city: nearestCity.city,
        words: prev.words,
      }
    })
  }, [nearestCity, pointSource])

  function handleMnemonicChange(next: Mnemonic | null) {
    setMnemonic(next)

    if (!next) return

    console.log("Валидная мнемоника:")
    console.log("Полное значение:", next.full)
    console.log("Город:", next.city)
    console.log("Слова:", next.words)
  }

  function handleMapChange(p: LatLngLiteral) {
    setPointSource("user")
    setPoint(p)
  }

  return (
    <>
      <h1>Mnemonic Map</h1>
      <MnemonicInput value={mnemonic} onChange={handleMnemonicChange} />

      <div>
        {cityLoading && <p>Ищем координаты города…</p>}
        {cityError && <p style={{ color: "red" }}>{cityError}</p>}
        {cityCoords && !cityError && (
          <p>
            Город: {cityCoords.displayName} — lat={cityCoords.lat.toFixed(6)}, lon=
            {cityCoords.lon.toFixed(6)}
          </p>
        )}
      </div>

      <div>
        {nearestLoading && pointSource === "user" && (
          <p>Определяем ближайший город по клику…</p>
        )}
        {nearestError && pointSource === "user" && (
          <p style={{ color: "red" }}>{nearestError}</p>
        )}
        {nearestCity && nearestCity.city && pointSource === "user" && (
          <p>Ближайший город к точке: {nearestCity.city}</p>
        )}
      </div>

      <div>
        <Map value={point} onChange={handleMapChange} />
        <pre>{JSON.stringify(point, null, 2)}</pre>
      </div>

      <div className="card">
        <button onClick={() => setCount(count => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        {import.meta.env.GEONAMES_USERNAME}
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
