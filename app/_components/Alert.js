"use client";

import { useEffect } from "react";
import { socket } from "./SocketProvider";
import { showNotificationToast } from "./NotificationToast";

function Alert() {
  useEffect(() => {
    const handleNewNotification = (data) => {
      showNotificationToast(data);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, []);

  return null;
}

export default Alert;
