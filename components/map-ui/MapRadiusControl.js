"use client";

const MIN_RADIUS = 10;
const MAX_RADIUS = 500;
export default function MapRadiusControl({ radius, handleRadiusChange }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 12,
        left: 12,
        right: 12,
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: 6,
        padding: "8px 12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        display: "none",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
        Radius: {radius ?? 0}m
      </span>
      <input
        type="range"
        min={MIN_RADIUS}
        max={MAX_RADIUS}
        step={5}
        value={radius ?? MIN_RADIUS}
        onChange={(e) => handleRadiusChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: "#800000" }}
      />
      <input
        type="number"
        min={MIN_RADIUS}
        max={MAX_RADIUS}
        value={radius ?? MIN_RADIUS}
        onChange={(e) => handleRadiusChange(Number(e.target.value))}
        style={{
          width: 60,
          fontSize: 12,
          padding: "2px 4px",
          border: "1px solid #ccc",
          borderRadius: 4,
        }}
      />
    </div>
  );
}
