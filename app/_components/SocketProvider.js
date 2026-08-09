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
