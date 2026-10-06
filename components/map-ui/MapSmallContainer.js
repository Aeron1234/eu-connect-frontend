"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useGetLocation } from "@/lib/helpers";
import LiveDtrLocationShare from "./LiveDtrLocationShare";

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
  const [sharedLocation, setSharedLocation] = useState(null);

  return (
    <div className="flex h-full min-h-64 w-full flex-col">
      <LiveDtrLocationShare onLocation={setSharedLocation} />
      <div className="min-h-64 flex-1">
        <MapSmall
          latitude={latitude}
          longitude={longitude}
          radius={radius}
          label={label}
          address={address}
          userLatitude={sharedLocation?.latitude ?? userLocation.latitude}
          userLongitude={sharedLocation?.longitude ?? userLocation.longitude}
        />
      </div>
    </div>
  );
}

export default MapSmallContainer;
