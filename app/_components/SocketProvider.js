"use client";
import { io } from "socket.io-client";
import { useEffect } from "react";

// 1. Create the single instance
export const socket = io("http://localhost:7000", {
  autoConnect: false,
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
