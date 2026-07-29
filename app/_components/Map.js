"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { CircleUser } from "lucide-react";
import { useEffect } from "react";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function Map({ result, coords, filteredBy }) {
  return (
    <MapContainer
      center={coords}
      zoom={filteredBy === "all" ? 6 : 11}
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

      <MapController center={coords} zoom={filteredBy === "all" ? 6 : 11} />

      {result.length > 0 && filteredBy !== "all"
        ? result.map((internship) =>
            internship.state_or_province
              .toLowerCase()
              .includes(filteredBy.toLowerCase()) ? (
              <PinMarker key={internship.id} internship={internship} />
            ) : null,
          )
        : null}

      {result.length > 0 && filteredBy === "all"
        ? result.map((internship) => (
            <PinMarker key={internship.id} internship={internship} />
          ))
        : null}
    </MapContainer>
  );
}

function PinMarker({ internship }) {
  const lat = parseFloat(internship.lat);
  const lon = parseFloat(internship.lon);

  if (isNaN(lat) || isNaN(lon)) return null;

  return (
    <Marker position={[lat, lon]}>
      <Popup>
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex gap-1">
            <CircleUser />
            <div className="flex flex-col gap-1 mt-1 text-stone-500">
              <span className="text-primary-500">
                {internship.first_name} {internship.last_name}
              </span>

              <span>{internship.course}</span>

              <span>{internship.company_name}</span>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-500 px-2 py-1 rounded-full text-center"
          >
            <span className="text-white">View on Google Maps</span>
          </a>
        </div>
      </Popup>
    </Marker>
  );
}

function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 }); // Smoothly flies to the new spot
    }
  }, [center, map, zoom]);

  return null;
}

export default Map;
