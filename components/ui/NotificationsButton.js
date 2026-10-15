"use client";

import Link from "next/link";
import NotificationBell from "../notifications-ui/NotificationBell";
import NotificationsDropdown from "../notifications-ui/NotificationsDropdown";
import useNotificationsDropdown from "../notifications-ui/useNotificationsDropdown";

function NotificationsButton() {
  const {
    dropdownRef, showNotifications, setShowNotifications, toggleNotifications,
    unreadCount, dropdownProps,
  } = useNotificationsDropdown();

  return (
    <div className="relative z-50 flex items-center" ref={dropdownRef}>
      <Link
        href="/notifications"
        onClick={() => setShowNotifications(false)}
        aria-label="View notifications"
        title="Notifications"
        className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground-soft transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden"
      >
        <NotificationBell unreadCount={unreadCount} />
      </Link>

      <button
        type="button"
        className="group relative hidden size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-foreground-soft transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:inline-flex"
        onClick={toggleNotifications}
        aria-label="Toggle notifications menu"
        aria-expanded={showNotifications}
        aria-controls={showNotifications ? "notifications-menu" : undefined}
        title="Notifications"
      >
        <NotificationBell
          unreadCount={unreadCount}
          isOpen={showNotifications}
        />
      </button>

      {showNotifications && (
        <NotificationsDropdown {...dropdownProps} />
      )}
    </div>
  );
}

export default NotificationsButton;
