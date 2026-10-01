"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const maroonIcon = L.divIcon({
  className: "",
  html: `
    <svg width="30" height="35" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.7 23.3 0 15 0z"
        fill="#800000"
        stroke="#5a0000"
        stroke-width="1"
      />
      <circle cx="15" cy="15" r="6" fill="#ffffff" />
    </svg>
  `,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -42],
});

function MapSmall({
  latitude,
  longitude,
  radius = 100,
  label = "",
  address = "",
}) {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lon)) return null;

  return (
    <MapContainer
      center={[lat, lon]}
      zoom={16}
      scrollWheelZoom={true}
      style={{
        height: "100%",
        width: "100%",
        borderRadius: "12px",
        zIndex: "0",
      }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[lat, lon]} icon={maroonIcon}>
        {(label || address) && (
          <Popup>
            <div className="text-sm">
              {label && <p className="font-semibold text-foreground">{label}</p>}
              {address && <p className="text-foreground-soft">{address}</p>}
            </div>
          </Popup>
        )}
        <Circle
          center={[lat, lon]}
          radius={Number(radius)}
          pathOptions={{
            color: "#800000",
            fillColor: "#800000",
            fillOpacity: 0.15,
            weight: 2,
          }}
        />
      </Marker>
    </MapContainer>
  );
}

export default MapSmall;
