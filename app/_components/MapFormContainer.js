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
}) {
  return (
    <div className="rounded-sm" style={mapStyle}>
      <MapForm
        data={data}
        setData={setData}
        formType={formType}
        defaultCoords={defaultCoords}
        radius={radius}
      />
    </div>
  );
}

export default MapFormContainer;
