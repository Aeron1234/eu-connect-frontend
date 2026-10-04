"use client";

import dynamic from "next/dynamic";
import { useGetLocation } from "@/lib/helpers";

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
  const userLocation = useGetLocation();

  return (
    <div className="rounded-sm" style={{ height: "100%", width: "100%" }}>
      <MapSmall
        latitude={latitude}
        longitude={longitude}
        radius={radius}
        label={label}
        address={address}
        userLatitude={userLocation.latitude}
        userLongitude={userLocation.longitude}
      />
    </div>
  );
}

export default MapSmallContainer;
