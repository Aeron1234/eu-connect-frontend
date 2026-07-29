"use client";

import dynamic from "next/dynamic";

const MapSmall = dynamic(() => import("app/_components/MapSmall"), {
  ssr: false,
});

function MapSmallContainer({ company_lat, company_lon }) {
  return (
    <div className="rounded-sm" style={{ height: "200px", width: "100%" }}>
      <MapSmall company_lat={company_lat} company_lon={company_lon} />
    </div>
  );
}

export default MapSmallContainer;
