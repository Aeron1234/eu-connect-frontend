"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import { maroonIcon } from "./mapFormIcons";
import useMapFormSelection from "./useMapFormSelection";
import MapViewSync from "./MapFormViewSync";
import SearchField from "./MapSearchControl";
import ClickMarker from "./MapClickMarker";
import MapRadiusControl from "./MapRadiusControl";
import MapLiveLocationMarkers from "./MapLiveLocationMarkers";

function MapForm({
  setData,
  data,
  formType,
  defaultCoords,
  radius = null,
  setRadius = null,
  liveLocation = null,
  children = null,
}) {
  const {
    selectedPosition,
    sharedPosition,
    initialCenter,
    handleLocationSelect,
    handleResolvedAddress,
    handleRadiusChange,
    showRadiusControl,
  } = useMapFormSelection({ setData, data, formType, defaultCoords, radius, setRadius, liveLocation });

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer
        center={initialCenter}
        zoom={14}
        scrollWheelZoom={true}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "4px",
          zIndex: "0",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {children}

        <MapViewSync position={selectedPosition} livePosition={sharedPosition} />

        <SearchField onLocationSelect={handleLocationSelect} />

        {/* Click-to-pin is now enabled for every form type, including internshipRecord */}
        <ClickMarker
          onLocationSelect={handleLocationSelect}
          onAddressResolved={handleResolvedAddress}
        />

        {selectedPosition && (
          <>
            <Marker
              key={`${selectedPosition[0]}-${selectedPosition[1]}`}
              position={selectedPosition}
              icon={maroonIcon}
            />
            {formType === "setDtrLocation" && radius > 0 && (
              <Circle
                center={selectedPosition}
                radius={Number(radius)}
                pathOptions={{
                  color: "#800000",
                  fillColor: "#800000",
                  fillOpacity: 0.15,
                  weight: 2,
                }}
              />
            )}
          </>
        )}
        {sharedPosition && formType === "setDtrLocation" && (
          <MapLiveLocationMarkers sharedPosition={sharedPosition} liveLocation={liveLocation} />
        )}
      </MapContainer>

      {showRadiusControl && (
        <MapRadiusControl radius={radius} handleRadiusChange={handleRadiusChange} />
      )}
    </div>
  );
}

export default MapForm;
