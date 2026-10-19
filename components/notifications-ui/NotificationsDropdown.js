"use client";

import Link from "next/link";
import { ArrowUpRight, Bell, X } from "lucide-react";
import NotificationDropdownSkeleton from "./NotificationDropdownSkeleton";
import NotificationDropdownItem from "./NotificationDropdownItem";
import NotificationDropdownPagination from "./NotificationDropdownPagination";
import ErrorUI from "@/components/ui/ErrorUI";

export default function NotificationsDropdown({
  unreadCount, setShowNotifications, inboxStatus, handleMarkAllRead, isMarkingAll,
  inboxQuery, notifications, openingId, markingId, deletingId,
  handleAnnouncementClick, handleOpenNotification, handleMarkRead, handleDismiss,
  totalPages, totalRecords, page, handlePageChange,
}) {
  return (
    <div
      id="notifications-menu"
      className="absolute top-full right-0 z-50 mt-2 hidden w-[min(25rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:block"
    >
      <div className="relative overflow-hidden bg-primary px-4 py-3.5 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full border-[24px] border-white/10" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Your inbox</p>
            <h2 className="mt-0.5 text-lg font-semibold tracking-tight">Notifications</h2>
            <p className="mt-0.5 text-xs text-white/75">
              {unreadCount > 0
                ? `${unreadCount} unread ${unreadCount === 1 ? "update" : "updates"}`
                : "You’re all caught up"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNotifications(false)}
            aria-label="Close notifications"
            className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/40 px-4 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Latest activity
        </span>
        {inboxStatus === "ready" && unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="text-xs font-semibold text-primary-emphasis transition hover:underline disabled:opacity-50"
          >
            {isMarkingAll ? "Marking…" : "Mark all read"}
          </button>
        )}
      </div>

      <div
        className="max-h-[min(20rem,calc(100vh-13rem))] min-h-28 overflow-y-auto custom-scrollbar"
        aria-busy={inboxStatus === "loading"}
      >
        {inboxStatus !== "loading" && inboxQuery.isError && inboxQuery.data && (
          <ErrorUI error={inboxQuery.error} compact logError={false} reset={() => {
            if (inboxQuery.isFetchNextPageError) void handlePageChange(page + 1);
            else void inboxQuery.refetch();
          }} />
        )}
        {inboxStatus === "loading" ? (
          <NotificationDropdownSkeleton />
        ) : inboxStatus === "error" ? (
          <ErrorUI error={inboxQuery.error} reset={() => void inboxQuery.refetch()} compact logError={false} />
        ) : notifications.length > 0 ? (
          <ul className="divide-y divide-border/70">
            {notifications.map((notif) => (
              <NotificationDropdownItem
                key={notif.ui_key || notif.id}
                notification={notif}
                openingId={openingId}
                markingId={markingId}
                deletingId={deletingId}
                handleAnnouncementClick={handleAnnouncementClick}
                handleOpenNotification={handleOpenNotification}
                handleMarkRead={handleMarkRead}
                handleDismiss={handleDismiss}
              />
            ))}
          </ul>
        ) : (
          <div className="flex min-h-28 flex-col items-center justify-center px-4 py-6 text-center">
            <Bell className="size-7 text-primary-emphasis/60" />
            <p className="mt-2 text-sm font-semibold text-foreground">Nothing here yet</p>
            <p className="mt-1 text-xs text-muted-foreground">New updates will appear in this inbox.</p>
          </div>
        )}
      </div>

      <NotificationDropdownPagination inboxStatus={inboxStatus} totalPages={totalPages} totalRecords={totalRecords} page={page} handlePageChange={handlePageChange} />

      <Link href="/notifications" onClick={() => setShowNotifications(false)} className="flex items-center justify-between border-t border-border bg-secondary/40 px-4 py-2.5 text-xs font-semibold text-primary-emphasis transition hover:bg-secondary">
        Open notification center
        <ArrowUpRight className="size-4" />
      </Link>
    </div>
  );
}
