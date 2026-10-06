"use client";

import { useEffect } from "react";
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

function ShowBothLocations({
  companyLatitude,
  companyLongitude,
  userLatitude,
  userLongitude,
}) {
  const map = useMap();

  useEffect(() => {
    if (userLatitude == null || userLongitude == null) {
      if (companyLatitude != null && companyLongitude != null) {
        map.setView([companyLatitude, companyLongitude], 16);
      }
      return;
    }
    if (companyLatitude != null && companyLongitude != null) {
      map.fitBounds(
        [[companyLatitude, companyLongitude], [userLatitude, userLongitude]],
        { padding: [36, 36], maxZoom: 16 },
      );
    } else {
      map.setView([userLatitude, userLongitude], 16);
    }
  }, [companyLatitude, companyLongitude, userLatitude, userLongitude, map]);

  return null;
}

function MapSmall({
  latitude,
  longitude,
  radius = 100,
  label = "",
  address = "",
  userLatitude,
  userLongitude,
}) {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const hasCompanyLocation =
    Number.isFinite(lat) && Number.isFinite(lon) &&
    Math.abs(lat) <= 90 && Math.abs(lon) <= 180 &&
    !(lat === 0 && lon === 0);
  const userLat = Number(userLatitude);
  const userLon = Number(userLongitude);
  const hasUserLocation =
    userLatitude != null && userLongitude != null &&
    Number.isFinite(userLat) && Number.isFinite(userLon) &&
    Math.abs(userLat) <= 90 && Math.abs(userLon) <= 180;

  const companyLocation = hasCompanyLocation ? [lat, lon] : null;
  const userLocation = hasUserLocation ? [userLat, userLon] : null;

  return (
    <MapContainer
      center={companyLocation || userLocation || [12.5, 122]}
      zoom={16}
      scrollWheelZoom={true}
      style={{
        height: "100%",
        width: "100%",
        zIndex: "0",
      }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ShowBothLocations
        companyLatitude={hasCompanyLocation ? lat : null}
        companyLongitude={hasCompanyLocation ? lon : null}
        userLatitude={hasUserLocation ? userLat : null}
        userLongitude={hasUserLocation ? userLon : null}
      />

      {hasCompanyLocation && (
        <Marker position={[lat, lon]} icon={maroonIcon}>
          {(label || address) && (
            <Popup>
              <div className="text-sm">
                {label && (
                  <p className="font-semibold text-foreground">{label}</p>
                )}
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
      )}
      {hasUserLocation && (
        <Marker position={[userLat, userLon]} zIndexOffset={1000}>
          <Popup>Your current location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default MapSmall;
