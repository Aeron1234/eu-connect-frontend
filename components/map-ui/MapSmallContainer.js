"use client";

import dynamic from "next/dynamic";

const MapSmall = dynamic(() => import("@/components/map-ui/MapSmall"), {
  ssr: false,
});

function MapSmallContainer({
  latitude = 0,
  longitude = 0,
  radius = 100,
  label = "",
  address = "",
}) {
  return (
    <div className="rounded-sm" style={{ height: "100%", width: "100%" }}>
      <MapSmall
        latitude={latitude}
        longitude={longitude}
        radius={radius}
        label={label}
        address={address}
      />
    </div>
  );
}

export default MapSmallContainer;
