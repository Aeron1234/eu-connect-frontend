"use client";
import { io } from "socket.io-client";
import { useEffect } from "react";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:7000";

let ticketStatus = null;

// Socket.IO calls this for every handshake, including automatic reconnects.
// The HttpOnly access cookie stays on the Next.js origin; only a short-lived,
// socket-only ticket reaches the browser and the Socket.IO server.
async function getSocketAuth(callback) {
  try {
    const res = await fetch("/api/socket-ticket", {
      method: "POST",
      cache: "no-store",
    });
    ticketStatus = res.status;
    if (!res.ok) return callback({ ticket: "" });

    const data = await res.json();
    callback({ ticket: data.ticket || "" });
  } catch {
    ticketStatus = null;
    callback({ ticket: "" });
  }
}

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: getSocketAuth,
  transports: ["websocket", "polling"],
  // Caps reconnection so a sleeping/unreachable backend (e.g. Render free
  // tier spin-down) doesn't retry indefinitely for hours while the tab
  // sits idle — without this, socket.io-client defaults to unlimited
  // retries every few seconds.
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
});

export default function SocketProvider({ children }) {
  useEffect(() => {
    let retryTimer;
    let retryCount = 0;

    function scheduleReconnect() {
      if (retryCount >= 10 || retryTimer) return;
      retryCount += 1;
      retryTimer = setTimeout(() => {
        retryTimer = null;
        if (!socket.connected) socket.connect();
      }, Math.min(1000 * 2 ** retryCount, 10000));
    }

    function onConnect() {
      retryCount = 0;
      clearTimeout(retryTimer);
      retryTimer = null;
    }

    function onConnectError() {
      // A missing session needs a fresh login, not a retry loop.
      if (ticketStatus !== 401) scheduleReconnect();
    }

    function onDisconnect(reason) {
      // The server disconnects at access-token expiry. Fetch a fresh ticket
      // (and refresh the HttpOnly session if needed) before rejoining.
      if (reason === "io server disconnect") scheduleReconnect();
    }

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onDisconnect);
    socket.connect();

    return () => {
      clearTimeout(retryTimer);
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
    };
  }, []);

  return children;
}
