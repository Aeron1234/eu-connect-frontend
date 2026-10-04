"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";

function pinIcon(count, active) {
  const label = String(count);
  return L.divIcon({
    className: "",
    html: `<svg width="25" height="41" viewBox="0 0 25 41" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))">
      <path d="M12.5 1C5.9 1 1 6.2 1 12.8c0 8.9 11.5 26.7 11.5 26.7S24 21.7 24 12.8C24 6.2 19.1 1 12.5 1Z" fill="${active ? "#710000" : "#800000"}" stroke="#4d0000" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="12.5" cy="12.5" r="8" fill="#fff"/>
      <text x="12.5" y="16" text-anchor="middle" fill="#710000" font-size="${label.length > 2 ? 8 : 11}" font-weight="700" font-family="Arial, sans-serif">${label}</text>
    </svg>`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

function FitBounds({ sites }) {
  const map = useMap();
  useEffect(() => {
    if (!sites.length) return;
    map.fitBounds(L.latLngBounds(sites.map((s) => [s.lat, s.lng])), {
      padding: [60, 60],
      maxZoom: 11,
    });
  }, [sites, map]);
  return null;
}

export default function Map({ sites, selectedId, onSelect }) {
  return (
    <MapContainer
      center={[12.5, 122]}
      zoom={6}
      scrollWheelZoom
      className="h-[540px] w-full rounded-xl"
      style={{ zIndex: "0" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds sites={sites} />
      {sites.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={pinIcon(s.interns.length, selectedId === s.id)}
          eventHandlers={{ click: () => onSelect(s.id) }}
        >
          <Popup>
            <div className="min-w-[220px]">
              <p className="font-display text-base font-bold text-primary-emphasis">
                {s.company}
              </p>
              <p className="text-xs text-muted-foreground">
                {s.address}
                {s.region_name ? `, ${s.region_name}` : ""}
              </p>
              <p className="mt-2 text-xs font-semibold text-foreground/70">
                {s.interns.length} intern{s.interns.length > 1 ? "s" : ""}{" "}
                on-site
              </p>
              <ul className="mt-1 space-y-1.5">
                {s.interns.map((i) => (
                  <li key={i.id} className="text-sm">
                    <span className="font-semibold">{i.name}</span>
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {i.role} · {i.course}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
