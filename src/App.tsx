import { useEffect, useMemo, useState } from "react"
import "./App.css"
import "leaflet/dist/leaflet.css"
import { Map } from "./Map"
import type { LatLngLiteral } from "leaflet"
import { MnemonicInput, type Mnemonic } from "./MnemonicInput"
import { useCityGeocoding } from "./useCityGeocoding"
import { getOffset, type GeoPoint } from "./offset"
import { dequantizeOffset, quantizeOffset } from "./offsetQuantizer"
import { bitsToQuantizedOffset, quantizedOffsetToBitsMinimal } from "./quantizedOffsetBits"


function App() {
  const [count, setCount] = useState(0)

  const [point, setPoint] = useState<LatLngLiteral>({
    lat: 51.505,
    lng: -0.09,
  })

  const [mnemonic, setMnemonic] = useState<Mnemonic | null>(null)

  const city = mnemonic?.city ?? ""

  const {
    coords: cityCoords,
    loading: cityLoading,
    error: cityError,
  } = useCityGeocoding(city)

  const offset = useMemo(() => {
    if (!cityCoords || !point) return null

    const origin: GeoPoint = { lat: cityCoords.lat, lon: cityCoords.lon }
    const target: GeoPoint = { lat: point.lat, lon: point.lng }

    return getOffset(origin, target)
  }, [cityCoords, point])


  const quantizedOffset = useMemo(() => {
    if (!offset) return null;

    return quantizeOffset(offset)
  }, [offset])
  
  const bits = useMemo(() => {
    if (!quantizedOffset) return null
    return quantizedOffsetToBitsMinimal(quantizedOffset)
  }, [quantizedOffset])

  
  const quantizedOffsetFromBits = useMemo(() => {
    if (!bits) return null

    return bitsToQuantizedOffset(bits)
  }, [bits])

  const dequantizedOffset = useMemo(() => {
    if (!quantizedOffsetFromBits) return null;

    return dequantizeOffset(quantizedOffsetFromBits);
  }, [quantizedOffsetFromBits]);

  const distanceStr =
    offset != null ? offset.distanceM.toFixed(1) : null

  const bearingDegStr =
    offset != null ? ((offset.bearingRad * 180) / Math.PI).toFixed(2) : null

  const dequantizedDistanceStr =
    dequantizedOffset != null ? dequantizedOffset.distanceM.toFixed(1) : null

  const dequantizedBearingDegStr =
    dequantizedOffset != null ? ((dequantizedOffset.bearingRad * 180) / Math.PI).toFixed(2) : null


  function handleMnemonicChange(next: Mnemonic | null) {
    setMnemonic(next)

    if (!next) return

    console.log("Валидная мнемоника:")
    console.log("Полное значение:", next.full)
    console.log("Город:", next.city)
    console.log("Слова:", next.words)
  }

  function handleMapChange(p: LatLngLiteral) {
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
            Город (origin): {cityCoords.displayName} — lat=
            {cityCoords.lat.toFixed(6)}, lon={cityCoords.lon.toFixed(6)}
          </p>
        )}
      </div>

      <div>
        {offset && (
          <>
            <p>
              <b>Исходные данные:</b>
              <br />
              Расстояние: {distanceStr} м
              <br />
              Азимут: {bearingDegStr}°
            </p>

            <p>
              <b>Деквантизованные данные</b>
              <br />
              Расстояние: {dequantizedDistanceStr} м
              <br />
              Азимут: {dequantizedBearingDegStr}°
            </p>
            {bits && (
              <p>
                <b>Битовая последовательность:</b>
                <br />
                {bits.join("")}
                <br />
                Длина: {bits.length} бит
              </p>
            )}
          </>
        )}

        {!offset && <p>Укажи город, а затем кликни на карту для точки.</p>}
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
