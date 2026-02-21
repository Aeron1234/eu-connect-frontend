"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MapSearch from "./MapSearch";
import { CircleUser } from "lucide-react";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function Map() {
  return (
    <div className="h-full w-full flex flex-col gap-4">
      <div className="w-full relative flex items-center gap-2  self-start">
        <MapSearch />
      </div>
      <MapContainer
        center={[13.9334, 121.4224]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[13.9334, 121.4224]}>
          <Popup>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex gap-1">
                <CircleUser />
                <div className="flex flex-col gap-1 mt-1 text-stone-500">
                  <span className="text-primary-500">Monkey D. Luffy</span>

                  <span>BSCS</span>

                  <span>ABC Company</span>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${13.9331},${121.4222}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-500 px-2 py-1 rounded-full"
              >
                <span className="text-white">View on Google Maps</span>
              </a>
            </div>
          </Popup>
        </Marker>
        <Marker position={[13.9306, 121.4313]}>
          <Popup>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex gap-1">
                <CircleUser />
                <div className="flex flex-col gap-1 mt-1 text-stone-500">
                  <span className="text-primary-500">Monkey D. Luffy</span>

                  <span>BSCS</span>

                  <span>ABC Company</span>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${13.9306},${121.4313}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-500 px-2 py-1 rounded-full"
              >
                <span className="text-white">View on Google Maps</span>
              </a>
            </div>
          </Popup>
        </Marker>
        <Marker position={[13.93, 121.4325]}>
          <Popup>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex gap-1">
                <CircleUser />
                <div className="flex flex-col gap-1 mt-1 text-stone-500">
                  <span className="text-primary-500">Monkey D. Luffy</span>

                  <span>BSCS</span>

                  <span>ABC Company</span>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${13.93},${121.4325}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-500 px-2 py-1 rounded-full"
              >
                <span className="text-white">View on Google Maps</span>
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default Map;
