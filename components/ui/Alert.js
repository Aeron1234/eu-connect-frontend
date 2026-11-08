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
      if (user?.id && ["dtr_location_set", "dtr_auto_close"].includes(data?.type)) {
        invalidateNotificationTarget(queryClient, user.id, data);
      }
      if (user?.id && data?.type === "announcement") {
        void queryClient.invalidateQueries({ queryKey: ["announcements", String(user.id)] });
      }
      showNotificationToast(data, {
        onOpen: () => {
          if (user?.id && data?.type === "internship_record_approved") invalidateNotificationTarget(queryClient, user.id, data);
        },
      });
    };

    socket.on("new_notification", handleNewNotification);
    const handleAnnouncementChange = () => {
      if (!user?.id) return;
      void queryClient.invalidateQueries({ queryKey: ["announcements", String(user.id)] });
      void queryClient.invalidateQueries({ queryKey: ["notifications", String(user.id)] });
      void queryClient.invalidateQueries({ queryKey: ["calendar", String(user.id)] });
    };
    socket.on("announcements_changed", handleAnnouncementChange);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("announcements_changed", handleAnnouncementChange);
    };
  }, [queryClient, user?.id]);

  return null;
}

export default Alert;
