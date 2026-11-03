"use client";

import { useEffect, useState } from "react";
import { socket } from "@/components/ui/SocketProvider";

// Subscribe staff map tools to a student's temporary DTR location session.
// Expose the latest location/status and release subscriptions when the target changes.
export default function useLiveDtrLocationWatch(studentId, internshipId) {
  const targetKey = studentId && internshipId ? `${studentId}:${internshipId}` : null;
  const [state, setState] = useState({ targetKey: null, location: null, status: null });
  // A different student must never briefly inherit the previous student's pin.
  const liveLocation = state.targetKey === targetKey ? state.location : null;
  const liveStatus = state.targetKey === targetKey && state.status
    ? state.status : "Waiting for the student to share a location.";

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
        setState({ targetKey, location: reply?.ok ? reply.location : null,
          status: reply?.ok
            ? reply.location ? "Student is sharing a live position." : "Waiting for the student to share a location."
            : reply?.error || "Live location unavailable." });
      });
    }
    function onUpdate(event) {
      if (String(event?.studentId) !== targetStudentId || String(event?.internshipId) !== targetInternshipId) return;
      setState({ targetKey, location: event.location, status: event.location
        ? "Student is sharing a live position."
        : "The student stopped sharing or their position expired." });
    }
    function onDisconnect() {
      setState({ targetKey, location: null, status: "Live connection unavailable." });
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
  }, [studentId, internshipId, targetKey]);

  // Expire the displayed pin after 60 seconds without a newer server-stamped position.
  useEffect(() => {
    if (!liveLocation) return;
    const timer = setTimeout(() => {
      setState({ targetKey, location: null, status: "The student's shared position expired." });
    }, Math.max(0, 60_000 - (Date.now() - liveLocation.timestamp)));
    return () => clearTimeout(timer);
  }, [liveLocation, targetKey]);
  return { liveLocation, liveStatus };
}
