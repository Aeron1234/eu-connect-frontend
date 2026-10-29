"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, CheckCircle2, X } from "lucide-react";
import { canDeleteNotification } from "@/lib/notification-permissions.mjs";
import { cx } from "@/lib/utils";
import { getNotificationTargetPath } from "@/lib/notification-routes";
import { getDropdownNotificationMeta } from "./notificationMetadata";

export default function NotificationDropdownItem({
  notification: notif, openingId, markingId, deletingId,
  handleAnnouncementClick, handleOpenNotification, handleMarkRead, handleDismiss,
}) {
  const meta = getDropdownNotificationMeta(notif.type);
  const Icon = meta.icon;
  const destination = getNotificationTargetPath(notif) || "/notifications";
  return (
    <li
      key={notif.ui_key || notif.id}
      className={cx(
        "relative transition-colors hover:bg-accent/60",
        !notif.is_read && "bg-primary/5 dark:bg-[color-mix(in_srgb,var(--primary)_5%,var(--card))] dark:hover:bg-[color-mix(in_srgb,var(--primary)_10%,var(--card))]",
      )}
    >
      {!notif.is_read && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-primary" />}
      <Link
        href={destination}
        onClick={(event) => notif.type === "announcement"
          ? void handleAnnouncementClick(event, notif)
          : handleOpenNotification(notif)}
        aria-busy={openingId === notif.id}
        className="group block px-4 py-2.5 pr-18 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
        aria-label={`Open ${notif.title}`}
      >
        <span className="flex items-start gap-2.5">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary-emphasis">
            <Icon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-primary-emphasis">
              {meta.label}
            </span>
            <span className="mt-0.5 block text-sm font-semibold leading-snug text-foreground line-clamp-2">
              {notif.title}
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {notif.message}
            </span>
            <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
              <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
            </span>
          </span>
        </span>
      </Link>
      <div className="absolute right-2 top-2 flex items-center gap-1">
        {!notif.is_read && (
          <button
            type="button"
            onClick={() => handleMarkRead(notif.id)}
            disabled={markingId === notif.id}
            aria-label={`Mark ${notif.title} as read`}
            title="Mark as read"
            className="grid size-7 place-items-center rounded-md text-muted-foreground transition hover:bg-primary/10 hover:text-primary-emphasis disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" />
          </button>
        )}
        {canDeleteNotification(notif) && <button
          type="button"
          onClick={() => handleDismiss(notif.id)}
          disabled={deletingId === notif.id}
          aria-label={`Delete ${notif.title}`}
          title="Delete notification"
          className="grid size-7 place-items-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        >
          <X className="size-4" />
        </button>}
      </div>
    </li>
  );
}
