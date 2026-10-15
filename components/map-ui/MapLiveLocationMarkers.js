"use client";

import { Marker, Circle, Popup } from "react-leaflet";

export default function MapLiveLocationMarkers({ sharedPosition, liveLocation }) {
  return (
    <>
      <Marker position={sharedPosition} zIndexOffset={1000}>
        <Popup>
          Student&apos;s shared location<br />
          Accuracy: about {Math.round(liveLocation.accuracy)} m
        </Popup>
      </Marker>
      <Circle
        center={sharedPosition}
        radius={liveLocation.accuracy}
        pathOptions={{ color: "#2774c7", fillColor: "#2774c7", fillOpacity: 0.08, weight: 1 }}
      />
    </>
  );
}
