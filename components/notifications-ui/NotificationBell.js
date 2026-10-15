"use client";

import { Bell } from "lucide-react";

export default function NotificationBell({ unreadCount, isOpen = false }) {
  return (
        <>
      <Bell
        className={`size-5 translate-y-0.5 transition-colors ${isOpen ? "fill-primary-emphasis text-primary-emphasis" : ""}`}
        strokeWidth={isOpen ? 2.5 : 2}
      />
      {unreadCount > 0 && (
        <span className="pointer-events-none absolute right-0 top-0 -translate-x-1/3 translate-y-1/3 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white shadow-sm">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </>
  );
}
