"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";

import {
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
  Marker,
  Circle,
} from "react-leaflet";

import { useEffect, useState } from "react";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";

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

function hasValidCoords(coords) {
  const [lat, lon] = coords || [];
  return (
    lat !== undefined &&
    lat !== null &&
    lat !== "" &&
    lon !== undefined &&
    lon !== null &&
    lon !== ""
  );
}

function MapForm({ setData, data, formType, defaultCoords, radius }) {
  const [selectedPosition, setSelectedPosition] = useState(() =>
    hasValidCoords(defaultCoords) ? defaultCoords : null,
  );

  useEffect(() => {
    if (hasValidCoords(defaultCoords)) {
      setSelectedPosition([defaultCoords[0], defaultCoords[1]]);
    }
  }, [defaultCoords[0], defaultCoords[1]]);

  const handleLocationSelect = (location) => {
    setSelectedPosition([location.y, location.x]);

    if (formType === "internshipRecord") {
      setData((prev) => ({
        ...prev,
        company_address: location.label,
        lat: location.y,
        lon: location.x,
      }));
    }

    if (formType === "setDtrLocation") {
      setData((prev) => ({
        ...prev,
        lat: location.y,
        lon: location.x,
      }));
    }
  };

  return (
    <MapContainer
      center={hasValidCoords(defaultCoords) ? defaultCoords : [13.931, 121.423]}
      zoom={14}
      scrollWheelZoom={true}
      style={{
        height: "100%",
        width: "100%",
        borderRadius: "4px",
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <SearchField onLocationSelect={handleLocationSelect} />

      {formType !== "internshipRecord" && (
        <ClickMarker
          formType={formType}
          onLocationSelect={handleLocationSelect}
          defaultCoords={defaultCoords}
        />
      )}

      {selectedPosition && (
        <>
          <Marker
            key={`${selectedPosition[0]}-${selectedPosition[1]}`}
            position={selectedPosition}
            icon={maroonIcon}
          />
          {formType === "setDtrLocation" && radius > 0 && (
            <Circle
              center={selectedPosition}
              radius={Number(radius)}
              pathOptions={{
                color: "#800000",
                fillColor: "#800000",
                fillOpacity: 0.15,
                weight: 2,
              }}
            />
          )}
        </>
      )}
    </MapContainer>
  );
}

function SearchField({ onLocationSelect }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: {
        "accept-language": "en",
        countrycodes: "ph",
      },
    });

    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      showMarker: false,
      showPopup: false,
      autoComplete: true,
      autoCompleteDelay: 1000,
      minLength: 3,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      keepResult: true,
      searchLabel: "Search for company address...",
    });

    map.addControl(searchControl);

    const handleShowLocation = (result) => {
      if (onLocationSelect) {
        onLocationSelect(result.location);
      }
    };

    map.on("geosearch/showlocation", handleShowLocation);

    return () => {
      map.off("geosearch/showlocation", handleShowLocation);
      map.removeControl(searchControl);
    };
  }, [map, onLocationSelect]);

  return null;
}

function ClickMarker({ onLocationSelect, formType, defaultCoords }) {
  const provider = new OpenStreetMapProvider({
    params: {
      "accept-language": "en",
      countrycodes: "ph",
    },
  });

  useMapEvents({
    async click(e) {
      if (formType === "internshipRecord") return;

      const { lat, lng } = e.latlng;

      let label = `${lat || defaultCoords[0]}, ${lng || defaultCoords[1]}`;

      try {
        const results = await provider.search({
          query: `${lat || defaultCoords[0]},${lng || defaultCoords[1]}`,
        });

        if (results.length > 0) {
          label = results[0].label;
        }
      } catch (err) {
        console.error(err);
      }

      onLocationSelect({
        label,
        x: lng || defaultCoords[0],
        y: lat || defaultCoords[1],
      });
    },
  });

  return null;
}

export default MapForm;
