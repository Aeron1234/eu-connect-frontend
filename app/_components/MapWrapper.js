"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("app/_components/Map"), {
  ssr: false,
});

function MapWrapper() {
  return <Map />;
}

export default MapWrapper;
