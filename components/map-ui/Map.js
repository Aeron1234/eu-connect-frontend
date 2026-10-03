"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";

function pinIcon(count, active) {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center">
      <svg width="34" height="46" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 8.5 12 22 12 22s12-13.5 12-22C24 5.4 18.6 0 12 0z" fill="${active ? "#7a1220" : "#9b1c2e"}"/>
      </svg>
      <span style="position:absolute;top:5px;left:0;right:0;text-align:center;color:#fff;font-size:12px;font-weight:700;font-family:inherit">${count}</span>
    </div>`,
    iconSize: [34, 46],
    iconAnchor: [17, 46],
    popupAnchor: [0, -42],
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
