import { useState } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";
import { Map } from "./Map"
import type { LatLngLiteral } from "leaflet";
import { MnemonicInput } from "./MnemonicInput";

function App() {
  const [count, setCount] = useState(0);
  const [point, setPoint] = useState<LatLngLiteral>({ lat: 51.505, lng: -0.09 });
  const [mnemonic, setMnemonic] = useState("")

  function handleValidChange(full: string, city: string, words: string[]) {
    console.log("Валидная мнемоника:")
    console.log("Полное значение:", full)
    console.log("Город:", city)
    console.log("Слова:", words)
  }

  return (
    <>
      <h1>Mnemonic Map</h1>
      <MnemonicInput
        value={mnemonic}
        onChange={setMnemonic}
        onValidChange={handleValidChange}
      />
      <div>
        <Map value={point} onChange={setPoint} />
        <pre>{JSON.stringify(point, null, 2)}</pre>
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
