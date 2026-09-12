"use client";
import { io } from "socket.io-client";
import { useEffect } from "react";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:7000";

// 1. Create the single instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
  // Caps reconnection so a sleeping/unreachable backend (e.g. Render free
  // tier spin-down) doesn't retry indefinitely for hours while the tab
  // sits idle — without this, socket.io-client defaults to unlimited
  // retries every few seconds.
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
});

export default function SocketProvider({ children, userId }) {
  useEffect(() => {
    if (userId) {
      socket.connect();

      socket.on("connect", () => {
        socket.emit("join", userId);
      });
    }

    return () => {
      socket.off("connect");
      socket.disconnect();
    };
  }, [userId]);

  return children;
}
