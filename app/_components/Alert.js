"use client";

import { useEffect } from "react";
import { socket } from "./SocketProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function Alert() {
  const router = useRouter();

  useEffect(() => {
    const handleNewNotification = (data) => {
      // console.log("Socket Data Received:", data);

      toast.info(data.title || "New Notification", {
        description: data.message,
        position: "top-right",
        duration: 5000,
        icon: "🔔",
        action: {
          label: "View",
          onClick: () => {
            router.push("/notifications");
          },
        },
        style: { backgroundColor: "#800000", color: "#fff" },
        classNames: {
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-primary-500",
          description: "text-white",
        },
      });
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [router]);

  return null;
}

export default Alert;
