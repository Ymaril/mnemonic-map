import { useEffect, useRef, useState, memo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import type { LatLngLiteral } from "leaflet";

type MapProps = {
  value: LatLngLiteral;
  onChange?: (value: LatLngLiteral) => void;
};

export function Map({ value, onChange }: MapProps) {
  const initialCenter = useRef<LatLngLiteral>(value);
  const [markerPos, setMarkerPos] = useState<LatLngLiteral>(value);

  useEffect(() => {
    if (value.lat !== markerPos.lat || value.lng !== markerPos.lng) {
      setMarkerPos(value);
    }
  }, [value, markerPos.lat, markerPos.lng]);

  const handleClick = (latlng: LatLngLiteral) => {
    setMarkerPos(latlng);
    onChange?.(latlng);
  };

  return (
    <MapContainer
      center={initialCenter.current}
      zoom={13}
      style={{ height: "25rem", width: "50rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler onClick={handleClick} />

      <Marker position={markerPos}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
}

type ClickHandlerProps = {
  onClick: (latlng: LatLngLiteral) => void;
};

const ClickHandler = memo(({ onClick }: ClickHandlerProps) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });

  return null;
});
