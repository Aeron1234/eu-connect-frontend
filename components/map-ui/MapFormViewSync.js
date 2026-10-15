"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function MapFormViewSync({ position, livePosition }) {
  const map = useMap();
  const lat = position?.[0];
  const lon = position?.[1];
  const liveLat = livePosition?.[0];
  const liveLon = livePosition?.[1];

  useEffect(() => {
    const nextPosition = lat === undefined || lon === undefined ? null : [lat, lon];
    const studentPosition = liveLat === undefined || liveLon === undefined ? null : [liveLat, liveLon];
    if (studentPosition && !map.getBounds().contains(studentPosition)) {
      if (nextPosition) {
        map.fitBounds([nextPosition, studentPosition], { padding: [36, 36], maxZoom: 16 });
      } else {
        map.setView(studentPosition, 16);
      }
    } else if (nextPosition && !map.getBounds().contains(nextPosition)) {
      map.setView(nextPosition, map.getZoom());
    }
  }, [map, lat, lon, liveLat, liveLon]);

  return null;
}
