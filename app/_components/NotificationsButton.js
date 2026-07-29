"use client";

import { useState, useEffect, useRef } from "react";
import CustomToolTip from "./CustomToolTip";
import { Bell } from "lucide-react";
import Link from "next/link";
import { socket } from "./SocketProvider";

function NotificationsButton({
  inboxData: { data = [], unreadCount: initialCount = 0 } = {},
}) {
  const [notifications, setNotifications] = useState(data);
  const [unreadCount, setUnreadCount] = useState(initialCount);

  const [showTooltipNotification, setShowTooltipNotification] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Sync state cleanly if server-side props re-fetch or change
  useEffect(() => {
    setNotifications(data);
    setUnreadCount(initialCount);
  }, [data, initialCount]);

  // 2. ISOLATED SOCKET LIFECYCLE: Set up listener exactly once on mount
  useEffect(() => {
    const handleNewNotification = (incoming) => {
      // Safely map incoming socket raw 'type' to the correct frontend UI category
      let resolvedCategory = incoming.type;
      if (incoming.type === "submission") {
        resolvedCategory = "evaluation_submission";
      } else if (incoming.type === "approved" || incoming.type === "rejected") {
        resolvedCategory = "record_status";
      }

      const generatedId = incoming.id || Date.now();
      const generatedLink = incoming.link_uuid || incoming.link || Date.now();

      const newNotif = {
        id: generatedLink,
        notification_id: generatedId,
        notification_title: incoming.title,
        notification_message: incoming.message,
        category: resolvedCategory,
        status: incoming.status || "pending",
        is_read: 0,
        created_at: new Date().toISOString(),
        ui_key: `${resolvedCategory}-${generatedLink}-${generatedId}`,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, []);

  // 3. SEPARATED UI LIFECYCLE: Handle click outside clicks only when open
  useEffect(() => {
    if (!showNotifications) return;

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <div className="relative inline-block h-full z-50" ref={dropdownRef}>
      <button
        className="group relative flex h-fit cursor-pointer hover:text-primary-500 transition-all"
        onClick={() => setShowNotifications((prev) => !prev)}
        title="Notifications"
      >
        <Bell
          className="h-6 w-6 transition-all"
          fill={showNotifications ? "#800000" : "#57534d"}
          stroke={showNotifications ? "#800000" : "#57534d"}
          strokeWidth={showNotifications ? 2.5 : 2}
        />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute bg-primary-500 px-1.5 py-0.5 rounded-full text-white font-bold text-[10px] top-0 right-0 translate-y-[-40%] translate-x-[30%] shadow-sm pointer-events-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="flex flex-col absolute p-2 w-80 bg-white right-0 translate-y-2.5 text-stone-800 rounded-md shadow-2xl border border-stone-200 z-50">
          <div className="font-semibold p-2 border-b border-stone-100 flex justify-between items-center">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded-full text-stone-500">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="py-2 flex flex-col gap-1 max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.ui_key}
                  className={`text-sm px-2 py-2 rounded-sm cursor-pointer transition-colors ${
                    notif.is_read
                      ? "hover:bg-stone-50"
                      : "bg-stone-100 font-medium"
                  }`}
                >
                  <p className="text-primary-500 leading-tight font-bold text-xs">
                    {notif.notification_title}
                  </p>
                  <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">
                    {notif.notification_message}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-sm p-4 text-center text-stone-400 italic">
                No notifications yet.
              </div>
            )}
          </div>

          <Link
            href={"/notifications"}
            className="text-primary-500 font-semibold hover:underline text-xs p-2 border-t border-stone-100 mt-2 text-center block w-full"
            onClick={() => setShowNotifications(false)}
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationsButton;
