"use client";

import dynamic from "next/dynamic";

const MapForm = dynamic(() => import("./MapForm"), {
  ssr: false,
});

function MapFormContainer({
  data,
  setData,
  formType = "",
  mapStyle,
  defaultCoords = [],
  radius = null,
  setRadius = null,
}) {
  return (
    <div className="overflow-hidden rounded-lg" style={mapStyle}>
      <MapForm
        data={data}
        setData={setData}
        formType={formType}
        defaultCoords={defaultCoords}
        radius={radius}
        setRadius={setRadius}
      />
    </div>
  );
}

export default MapFormContainer;
