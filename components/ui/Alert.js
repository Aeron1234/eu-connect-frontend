"use client";

import { useEffect } from "react";
import { socket } from "./SocketProvider";
import { showNotificationToast } from "./NotificationToast";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { invalidateNotificationTarget } from "@/components/notifications-ui/notificationActions";

function Alert() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  useEffect(() => {
    const handleNewNotification = (data) => {
      showNotificationToast(data, {
        onOpen: () => {
          if (user?.id && data?.type === "internship_record_approved") invalidateNotificationTarget(queryClient, user.id, data);
        },
      });
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [queryClient, user?.id]);

  return null;
}

export default Alert;
