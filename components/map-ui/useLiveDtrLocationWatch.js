"use client";

import { useEffect, useState } from "react";
import { socket } from "@/components/ui/SocketProvider";

export default function useLiveDtrLocationWatch(studentId, internshipId) {
  const [liveLocation, setLiveLocation] = useState(null);
  const [liveStatus, setLiveStatus] = useState("Waiting for the student to share a location.");

  useEffect(() => {
    if (!studentId || !internshipId) return;
    const targetStudentId = String(studentId);
    const targetInternshipId = String(internshipId);
    let active = true;
    // Ignore acknowledgements from older subscriptions after reconnect, renewal
    // or a target change; the backend rechecks access on each subscription.
    let subscriptionVersion = 0;

    function subscribe() {
      const version = ++subscriptionVersion;
      socket.emit("dtr_location:watch", {
        studentId: targetStudentId, internshipId: targetInternshipId,
      }, (reply) => {
        if (!active || version !== subscriptionVersion) return;
        setLiveLocation(reply?.ok ? reply.location : null);
        setLiveStatus(reply?.ok
          ? reply.location ? "Student is sharing a live position." : "Waiting for the student to share a location."
          : reply?.error || "Live location unavailable.");
      });
    }
    function onUpdate(event) {
      if (String(event?.studentId) !== targetStudentId || String(event?.internshipId) !== targetInternshipId) return;
      setLiveLocation(event.location);
      setLiveStatus(event.location
        ? "Student is sharing a live position."
        : "The student stopped sharing or their position expired.");
    }
    function onDisconnect() {
      setLiveLocation(null);
      setLiveStatus("Live connection unavailable.");
    }
    socket.on("dtr_location:update", onUpdate);
    socket.on("connect", subscribe);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) subscribe();
    // Renew every 30 seconds because the server grants a 60-second watch lease.
    const accessTimer = setInterval(() => {
      if (socket.connected) subscribe();
    }, 30_000);
    return () => {
      active = false;
      subscriptionVersion += 1;
      clearInterval(accessTimer);
      socket.off("dtr_location:update", onUpdate);
      socket.off("connect", subscribe);
      socket.off("disconnect", onDisconnect);
      if (socket.connected) socket.emit("dtr_location:unwatch");
    };
  }, [studentId, internshipId]);

  // Expire the displayed pin after 60 seconds without a newer server-stamped position.
  useEffect(() => {
    if (!liveLocation) return;
    const timer = setTimeout(() => {
      setLiveLocation(null);
      setLiveStatus("The student's shared position expired.");
    }, Math.max(0, 60_000 - (Date.now() - liveLocation.timestamp)));
    return () => clearTimeout(timer);
  }, [liveLocation]);
  return { liveLocation, liveStatus };
}
