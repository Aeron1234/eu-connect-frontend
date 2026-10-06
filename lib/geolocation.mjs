export function getFreshLocation(geolocation = globalThis.navigator?.geolocation) {
  return new Promise((resolve, reject) => {
    if (!geolocation) {
      reject(new Error("Location is unavailable. Enable location services and try again."));
      return;
    }

    geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude, accuracy } = coords;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
            Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
          reject(new Error("Your phone could not provide a valid location. Please try again."));
          return;
        }
        resolve({ latitude, longitude, accuracy });
      },
      (error) => {
        const message = error.code === 1
          ? "Location permission was denied. Allow location access and try again."
          : error.code === 3
            ? "Locating timed out. Move to an open area and try again."
            : "Your current location could not be determined. Please try again.";
        reject(new Error(message));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}
