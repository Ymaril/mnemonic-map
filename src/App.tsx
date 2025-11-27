import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";
import { Map } from "./Map";
import type { LatLngLiteral } from "leaflet";
import { MnemonicInput, type Mnemonic } from "./MnemonicInput";
import { useCityGeocoding } from "./useCityGeocoding";
import { getOffset, moveFrom, type GeoPoint } from "./offset";
import { quantizeOffset, dequantizeOffset } from "./offsetQuantizer";
import {
  quantizedOffsetToBitsMinimal,
  bitsToQuantizedOffset,
} from "./quantizedOffsetBits";
import { bitsToBip39Words, bip39WordsToBits } from "./bip39";

const DEFAULT_POINT: LatLngLiteral = { lat: 51.505, lng: -0.09 };

function App() {
  const [mnemonic, setMnemonic] = useState<Mnemonic | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("m");
    const full = (fromQuery ?? "Zelenograd another sketch").trim();
    if (!full) return null;
    const [city, ...words] = full.split(/\s+/);
    if (!city) return null;
    return { full, city, words };
  });

  const city = mnemonic?.city ?? "";

  const {
    coords: cityCoords,
    loading: cityLoading,
    error: cityError,
  } = useCityGeocoding(city);

  const { decodedPoint, decodeError } = useMemo(() => {
    if (!cityCoords || !mnemonic) {
      return { decodedPoint: null as LatLngLiteral | null, decodeError: null as string | null };
    }

    const origin: GeoPoint = { lat: cityCoords.lat, lon: cityCoords.lon };

    if (mnemonic.words.length === 0) {
      const nearbyLat = origin.lat + 0.01;
      const nearbyLon = origin.lon + 0.01;
      const point: LatLngLiteral = { lat: nearbyLat, lng: nearbyLon };
      return { decodedPoint: point, decodeError: null };
    }

    try {
      const bits = bip39WordsToBits(mnemonic.words);
      const q = bitsToQuantizedOffset(bits);
      const offset = dequantizeOffset(q);
      const p = moveFrom(origin, offset);
      const point: LatLngLiteral = { lat: p.lat, lng: p.lon };
      return { decodedPoint: point, decodeError: null };
    } catch (e) {
      const message =
        e instanceof Error && e.message
          ? e.message
          : "Invalid mnemonic phrase";
      return { decodedPoint: null as LatLngLiteral | null, decodeError: message };
    }
  }, [cityCoords, mnemonic]);

  const mapPoint: LatLngLiteral = decodedPoint ?? DEFAULT_POINT;

  function handleMnemonicChange(next: Mnemonic | null) {
    setMnemonic(next);
  }

  useEffect(() => {
    if (!mnemonic) return;
    const params = new URLSearchParams(window.location.search);
    params.set("m", mnemonic.full);
    const newUrl =
      window.location.pathname + "?" + params.toString() + window.location.hash;
    window.history.replaceState(null, "", newUrl);
  }, [mnemonic]);

  const initialCenterRef = useRef<LatLngLiteral | null>(null);
  if (!initialCenterRef.current) {
    initialCenterRef.current = mapPoint;
  }

  function handleMapChange(p: LatLngLiteral) {
    if (!mnemonic || !cityCoords) return;

    const origin: GeoPoint = { lat: cityCoords.lat, lon: cityCoords.lon };
    const target: GeoPoint = { lat: p.lat, lon: p.lng };

    const offset = getOffset(origin, target);
    const q = quantizeOffset(offset);
    const bits = quantizedOffsetToBitsMinimal(q);
    const words = bitsToBip39Words(bits);
    const full = [mnemonic.city, ...words].join(" ");

    setMnemonic({
      city: mnemonic.city,
      words,
      full,
    });
  }

  return (
    <>
      <h1>Mnemonic Map</h1>

      <MnemonicInput value={mnemonic} onChange={handleMnemonicChange} />

      {cityLoading && <p>Searching for city coordinates…</p>}
      {cityError && <p style={{ color: "red" }}>{cityError}</p>}
      {decodeError && <p style={{ color: "red" }}>{decodeError}</p>}

      <Map value={mapPoint} onChange={handleMapChange} />
    </>
  );
}

export default App;
