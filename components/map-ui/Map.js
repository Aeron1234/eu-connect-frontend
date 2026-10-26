"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, Polyline, CircleMarker, Circle, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";
import { directionsUrl } from "./mapVisitPlanning.mjs";

function pinIcon(count, active, showCount) {
  const label = String(count);
  return L.divIcon({
    className: "",
    html: `<svg width="25" height="41" viewBox="0 0 25 41" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))">
      <path d="M12.5 1C5.9 1 1 6.2 1 12.8c0 8.9 11.5 26.7 11.5 26.7S24 21.7 24 12.8C24 6.2 19.1 1 12.5 1Z" fill="${active ? "#710000" : "#800000"}" stroke="#4d0000" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="12.5" cy="12.5" r="${showCount ? 8 : 5}" fill="#fff"/>
      ${showCount ? `<text x="12.5" y="16" text-anchor="middle" fill="#710000" font-size="${label.length > 2 ? 8 : 11}" font-weight="700" font-family="Arial, sans-serif">${label}</text>` : ""}
    </svg>`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

function CompanyGoogleMapsLink({ site, origin }) {
  const href = directionsUrl(site, origin || undefined);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-primary-emphasis hover:underline"
    >
      See on Google Maps <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
    </a>
  );
}

function FitBounds({ sites, maxZoom, route }) {
  const map = useMap();
  useEffect(() => {
    const routePoints = route?.geometry?.coordinates?.map(([lng, lat]) => [lat, lng]);
    if (!sites.length && !routePoints?.length) return;
    map.fitBounds(L.latLngBounds(routePoints?.length ? routePoints : sites.map((s) => [s.lat, s.lng])), {
      padding: [60, 60],
      maxZoom: routePoints?.length ? Math.max(maxZoom, 14) : maxZoom,
    });
  }, [sites, map, maxZoom, route]);
  return null;
}

function ViewerLocationControl({ position, hasRoute }) {
  const map = useMap();
  const centered = useRef(false);
  useEffect(() => {
    if (!centered.current) {
      centered.current = true;
      if (!hasRoute) map.setView([position.latitude, position.longitude], 14);
    }
  }, [map, position, hasRoute]);
  return <button type="button" onClick={() => map.setView([position.latitude, position.longitude], 14)} className="absolute bottom-6 left-3 z-1000 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow" aria-label="Center map on my location">Locate me</button>;
}

export default function Map({
  sites,
  selectedId,
  onSelect,
  className = "h-[540px] w-full rounded-xl",
  fitBoundsMaxZoom = 11,
  showPinCount = true,
  showCompanyPopups = true,
  showGoogleMapsLink = false,
  route = null,
  origin = null,
  viewerPosition = null,
}) {
  return (
    <MapContainer
      center={[12.5, 122]}
      zoom={6}
      scrollWheelZoom
      className={className}
      style={{ zIndex: "0" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds sites={sites} maxZoom={fitBoundsMaxZoom} route={route} />
      {viewerPosition && <>
        <ViewerLocationControl position={viewerPosition} hasRoute={Boolean(route)} />
        <Circle center={[viewerPosition.latitude, viewerPosition.longitude]} radius={viewerPosition.accuracy} pathOptions={{ color: "#2563eb", fillOpacity: 0.08, weight: 1 }} />
        <CircleMarker center={[viewerPosition.latitude, viewerPosition.longitude]} radius={8} pathOptions={{ color: "white", fillColor: "#2563eb", fillOpacity: 1, weight: 3 }}><Popup>Your current location<br />Accuracy: about {Math.round(viewerPosition.accuracy)} m</Popup></CircleMarker>
      </>}
      {origin && !origin.live && <Marker position={[origin.lat, origin.lng]} icon={L.divIcon({
        className: "", html: '<span style="display:grid;place-items:center;width:30px;height:30px;border:3px solid white;border-radius:50%;background:#800000;color:white;font-weight:bold;box-shadow:0 1px 5px #0008">C</span>',
        iconSize: [30, 30], iconAnchor: [15, 15],
      })}><Popup>{origin.label}<br />Visit starting point</Popup></Marker>}
      {route?.geometry?.coordinates && <>
        <Polyline positions={route.geometry.coordinates.map(([lng, lat]) => [lat, lng])} pathOptions={{ color: "#ffffff", weight: 9, opacity: 0.9 }} />
        <Polyline positions={route.geometry.coordinates.map(([lng, lat]) => [lat, lng])} pathOptions={{ color: "#800000", weight: 5, opacity: 0.95 }} />
      </>}
      {sites.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={pinIcon(s.interns.length, selectedId === s.id, showPinCount)}
          eventHandlers={{ click: () => onSelect?.(s.id) }}
        >
          {showCompanyPopups && <Popup>
            <div className="min-w-[220px]">
              <p className="font-display text-base font-bold text-primary-emphasis">
                {s.company}
              </p>
              <p className="text-xs text-muted-foreground">
                {s.address}
                {s.region_name ? `, ${s.region_name}` : ""}
              </p>
              {showGoogleMapsLink && <CompanyGoogleMapsLink site={s} origin={origin} />}
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
          </Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
}
