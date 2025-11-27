import { useEffect, memo } from "react"
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet"
import type { LatLngLiteral } from "leaflet"

type MapProps = {
  value: LatLngLiteral
  onChange?: (value: LatLngLiteral) => void
}

export function Map({ value, onChange }: MapProps) {
  return (
    <MapContainer
      center={value}
      zoom={13}
      style={{ height: "25rem", width: "50rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler onClick={latlng => onChange?.(latlng)} />

      <Marker position={value}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>

      <CenterOnValue center={value} />
    </MapContainer>
  )
}

type ClickHandlerProps = {
  onClick: (latlng: LatLngLiteral) => void
}

const ClickHandler = memo(({ onClick }: ClickHandlerProps) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng)
    },
  })

  return null
})

type CenterOnValueProps = {
  center: LatLngLiteral
}

const CenterOnValue = memo(({ center }: CenterOnValueProps) => {
  const map = useMap()

  useEffect(() => {
    map.setView(center)
  }, [map, center.lat, center.lng])

  return null
})
