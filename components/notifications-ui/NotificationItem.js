"use client";

import { X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cx } from "@/lib/utils";
import { getNotificationItemMeta, TONE_STYLES } from "./notificationMetadata";
import NotificationResponseActions from "./NotificationResponseActions";
import useNotificationItem from "./useNotificationItem";

function NotificationItem({ item, onChanged }) {
  const {
    isPending, isDeleting, isOpeningAnnouncement, isActionable, isClickable, canDelete,
    handleOpen, handleRespond, handleDelete,
  } = useNotificationItem(item, onChanged);
  const meta = getNotificationItemMeta(item.type);
  const Icon = meta.icon;

  return (
    <div
      onClick={handleOpen}
      aria-busy={isOpeningAnnouncement}
      className={cx(
        "relative flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
        item.is_read
          ? "border-border bg-background"
          : "border-primary-200 bg-primary-50/40 dark:border-primary dark:bg-[color-mix(in_srgb,var(--primary)_5%,var(--card))]",
        isClickable && "cursor-pointer hover:shadow-sm",
      )}
    >
      <span
        className={cx(
          "grid size-9 shrink-0 place-items-center rounded-full",
          TONE_STYLES[meta.tone],
        )}
      >
        <Icon className="size-4.5" />
      </span>

      <div className="min-w-0 flex-1 pr-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{item.title}</p>
          {!item.is_read && (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>

        <p className="mt-0.5 text-sm text-muted-foreground">{item.message}</p>

        <p className="mt-1 text-xs text-muted-foreground/70">
          {item.sender
            ? `${item.sender.first_name} ${item.sender.last_name} · `
            : ""}
          {formatDistanceToNow(new Date(item.created_at), {
            addSuffix: true,
          })}
        </p>

        {isActionable && (
          <NotificationResponseActions handleRespond={handleRespond} isPending={isPending} />
        )}
      </div>

      {canDelete && <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="Delete notification"
        title="Delete notification"
        className="absolute right-3 top-3 text-muted-foreground/60 transition hover:text-destructive disabled:opacity-50"
      >
        <X className="size-3.5" />
      </button>}
    </div>
  );
}

export default NotificationItem;
