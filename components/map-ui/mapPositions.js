// Presence check only: allow zero coordinates and reject null/empty members.
// Use toPosition below for numeric conversion and geographic range validation.
export function hasValidCoords(coords) {
  const [lat, lon] = coords || [];
  return (
    lat !== undefined &&
    lat !== null &&
    lat !== "" &&
    lon !== undefined &&
    lon !== null &&
    lon !== ""
  );
}

// Normalize [latitude, longitude] for Leaflet, returning null for invalid/missing coordinates.
// OSRM request coordinates use the opposite order and must be converted separately.
export function toPosition(coords) {
  if (!hasValidCoords(coords)) return null;
  const lat = Number(coords[0]);
  const lon = Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return [lat, lon];
}
