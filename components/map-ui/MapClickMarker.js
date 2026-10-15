"use client";

import { useMemo } from "react";
import { useMapEvents } from "react-leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";

export default function MapClickMarker({ onLocationSelect, onAddressResolved }) {
  const provider = useMemo(
    () =>
      new OpenStreetMapProvider({
        params: {
          "accept-language": "en",
          countrycodes: "ph",
        },
      }),
    [],
  );

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      const version = onLocationSelect({
        label: `${lat}, ${lng}`,
        x: lng,
        y: lat,
      });

      try {
        const results = await provider.search({
          query: `${lat},${lng}`,
        });

        if (results.length > 0) {
          onAddressResolved({
            version,
            label: results[0].label,
            lat,
            lon: lng,
          });
        }
      } catch (err) {
        console.error(err);
      }
    },
  });

  return null;
}
