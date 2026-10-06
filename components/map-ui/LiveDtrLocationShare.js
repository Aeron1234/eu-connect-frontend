"use client";

import { useEffect, useState } from "react";
import { MapPin, Radio } from "lucide-react";
import { useGetLocation } from "@/lib/helpers";
import { socket } from "@/components/ui/SocketProvider";

const UPDATE_INTERVAL_MS = 20_000;

function LiveDtrLocationShare({ onLocation }) {
  const { refreshLocation } = useGetLocation(false);
  const [sharing, setSharing] = useState(false);
  const [status, setStatus] = useState("Share your current position with staff setting your DTR location.");
  const [accuracy, setAccuracy] = useState(null);

  useEffect(() => {
    if (!sharing) return;
    let active = true;
    let timer;
    let waitingForPosition = false;

    async function update() {
      if (waitingForPosition) return;
      waitingForPosition = true;
      setStatus("Getting a fresh location...");
      try {
        const { latitude, longitude, accuracy: accuracyMeters } = await refreshLocation();
        if (!active) return;
        onLocation({ latitude, longitude });
        setAccuracy(accuracyMeters);
        if (!socket.connected) {
          setStatus("Waiting for the live connection...");
        } else {
          socket.emit("dtr_location:share", {
            latitude, longitude, accuracy: accuracyMeters, timestamp: Date.now(),
          }, (reply) => {
            if (!active) return;
            setStatus(reply?.ok
              ? "Sharing with authorized staff while this page is open."
              : reply?.error || "Could not share your location.");
          });
        }
      } catch (error) {
        if (!active) return;
        setStatus(error.message || "Could not get your location.");
        if (error.message?.includes("permission was denied")) {
          setSharing(false);
          return;
        }
      } finally {
        waitingForPosition = false;
      }
      if (active) timer = setTimeout(update, socket.connected ? UPDATE_INTERVAL_MS : 3_000);
    }

    function onConnect() {
      if (!active) return;
      clearTimeout(timer);
      update();
    }
    function onDisconnect() {
      if (active) setStatus("Connection lost. Your shared pin will disappear until reconnected.");
    }
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    update();
    return () => {
      active = false;
      clearTimeout(timer);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      if (socket.connected) socket.emit("dtr_location:stop");
    };
  }, [sharing, refreshLocation, onLocation]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2 text-xs">
      <div className="flex min-w-0 items-center gap-2 text-foreground-soft">
        <MapPin className="size-4 shrink-0 text-primary-emphasis" aria-hidden="true" />
        <span role="status">{status}{sharing && Number.isFinite(accuracy) ? ` Accuracy: about ${Math.round(accuracy)} m.` : ""}</span>
      </div>
      <button
        type="button"
        onClick={() => {
          if (!sharing && !socket.connected) socket.connect();
          setSharing((current) => !current);
          if (sharing) {
            setAccuracy(null);
            setStatus("Location sharing stopped.");
          }
        }}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 font-medium ${sharing ? "bg-muted text-foreground" : "bg-primary text-white"}`}
      >
        <Radio className="size-3.5" aria-hidden="true" />
        {sharing ? "Stop sharing" : "Share location"}
      </button>
    </div>
  );
}

export default LiveDtrLocationShare;
