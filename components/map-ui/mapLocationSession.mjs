// Poll fresh one-shot GPS reads, waiting 10 seconds after each attempt finishes.
// No watchPosition subscription or navigation history is created.
export function startMapLocationSession({
  socket,
  geolocation,
  onPosition,
  onStatus,
  now = Date.now,
  schedule = setTimeout,
  cancel = clearTimeout,
  sessionId = globalThis.crypto.randomUUID(),
}) {
  let active = true,
    timer,
    expiry,
    waiting = false;
  function later() {
    if (active) timer = schedule(update, 10000);
  }
  function publish(position) {
    if (!active) return;
    const { latitude, longitude, accuracy } = position.coords;
    if (
      ![latitude, longitude, accuracy].every(Number.isFinite) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180 ||
      accuracy < 0 ||
      accuracy > 100000 ||
      !Number.isFinite(position.timestamp) ||
      position.timestamp < now() - 30000
    ) {
      onStatus("A fresh location could not be obtained.");
      return;
    }
    const location = {
      latitude,
      longitude,
      accuracy,
      timestamp: position.timestamp,
    };
    // The device pin and directions remain usable if the WebSocket is reconnecting.
    onPosition(location);
    cancel(expiry);
    // Expire a published fix after 45 seconds without replacement; device location
    // continues to work when the socket is unavailable.
    expiry = schedule(() => {
      if (active) {
        onPosition(null);
        onStatus("Location expired. Waiting for a fresh position.");
      }
    }, 45000);
    if (!socket.connected) {
      onStatus("Using device location. Live connection is reconnecting.");
      return;
    }
    onStatus("Updating live location…");
    socket
      .timeout(8000)
      .emit(
        "map_location:update",
        { ...location, sessionId },
        (error, reply) => {
          if (!active) return;
          onStatus(
            error
              ? "Using device location. Live connection is unavailable."
              : reply?.ok
                ? "Live location updated over WebSocket."
                : reply?.error || "Using device location. Live update failed.",
          );
        },
      );
  }
  function update() {
    if (!active || waiting) return;
    waiting = true;
    cancel(timer);
    geolocation.getCurrentPosition(
      (position) => {
        waiting = false;
        publish(position);
        later();
      },
      (error) => {
        waiting = false;
        if (!active) return;
        onStatus(
          error.code === 1
            ? "Location permission was denied. Use Candelaria or enable location permission and retry."
            : "Could not get your location. Retrying…",
        );
        if (error.code === 1) {
          onPosition(null);
          return;
        }
        later();
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  }
  // Accept echoes only for this map-session ID and a recent timestamp, so another
  // tab/session cannot replace the displayed fix through this listener.
  function received(message) {
    if (
      active &&
      message?.sessionId === sessionId &&
      message.location?.timestamp >= now() - 30000
    )
      onPosition(message.location);
  }
  function disconnected() {
    if (active)
      onStatus("Using device location. Live connection is reconnecting.");
  }
  socket.on("map_location:position", received);
  socket.on("connect", update);
  socket.on("disconnect", disconnected);
  if (!socket.connected) socket.connect();
  update();
  // Ignore late callbacks and remove timers/listeners on stop or unmount.
  // The socket stop event invalidates backend authorization work still in flight.
  return () => {
    active = false;
    cancel(timer);
    cancel(expiry);
    socket.off("map_location:position", received);
    socket.off("connect", update);
    socket.off("disconnect", disconnected);
    if (socket.connected) socket.emit("map_location:stop");
  };
}
