"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapSmall({ company_lat, company_lon }) {
  const lat = parseFloat(company_lat);
  const lon = parseFloat(company_lon);

  if (isNaN(lat) || isNaN(lon)) return null;

  return (
    <MapContainer
      center={[lat, lon]}
      zoom={14}
      scrollWheelZoom={true}
      style={{
        height: "100%",
        width: "100%",
        borderRadius: "4px",
        zIndex: "0",
      }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[lat, lon]}>
        <Popup />
      </Marker>
    </MapContainer>
  );
}

export default MapSmall;
