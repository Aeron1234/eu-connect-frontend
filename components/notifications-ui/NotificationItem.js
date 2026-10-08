"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Award,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ClipboardX,
  FileText,
  MapPin,
  Megaphone,
  UserCheck,
  UserPlus,
  UserX,
  X,
  XCircle,
} from "lucide-react";
import { cx } from "@/lib/utils";
import { getNotificationTargetPath } from "@/lib/notification-routes";
import { toastAndAction } from "../../lib/helpers";
import {
  markAsRead,
  deleteNotification,
} from "@/lib/server-actions/notifications-actions";
import { respondToSupervisorRequest } from "@/lib/server-actions/supervisor-actions";

const TYPE_META = {
  announcement: { icon: Megaphone, tone: "primary" },
  calendar_schedule: { icon: CalendarDays, tone: "success" },
  internship_record_request: { icon: FileText, tone: "primary" },
  internship_record_approved: { icon: CheckCircle2, tone: "success" },
  internship_record_rejected: { icon: XCircle, tone: "destructive" },
  internship_record_finished: { icon: CheckCircle2, tone: "success" },
  internship_record_force_finished: { icon: CheckCircle2, tone: "success" },
  evaluation_submitted: { icon: ClipboardCheck, tone: "primary" },
  evaluation_deleted: { icon: ClipboardX, tone: "muted" },
  certificate_uploaded: { icon: Award, tone: "success" },
  supervisor_request_submitted: { icon: UserPlus, tone: "primary" },
  supervisor_request_accepted: { icon: UserCheck, tone: "success" },
  supervisor_request_rejected: { icon: UserX, tone: "destructive" },
  dtr_location_set: { icon: MapPin, tone: "primary" },
};

const TONE_STYLES = {
  primary: "bg-primary/10 text-primary-emphasis",
  success: "bg-emerald-50 text-emerald-600",
  destructive: "bg-red-50 text-red-600",
  muted: "bg-secondary text-muted-foreground",
};

function NotificationItem({ item, onChanged }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  // Hide response actions immediately after submitting, before the refresh.
  // The parent remounts this item when the server's actionable state changes.
  const [respondedOverride, setRespondedOverride] = useState(null);
  const isActionable = respondedOverride === false ? false : item.actionable;

  const meta = TYPE_META[item.type] ?? { icon: FileText, tone: "muted" };
  const Icon = meta.icon;
  const targetPath = getNotificationTargetPath(item);
  const isClickable = !isActionable && (!item.is_read || Boolean(targetPath));

  function handleOpen() {
    if (isActionable) return;

    if (targetPath) {
      // Skip the optimistic local re-render here — this page is about to
      // be unmounted by the navigation anyway, so there's nothing to
      // visually update. Mutating this card's DOM node (via updateItem)
      // in the same tick as router.push is what causes Next's "Cannot
      // read properties of undefined (reading 'startTime')" crash — a
      // known web-vitals/INP timing bug when the clicked element gets
      // removed before its interaction entry finishes being read.
      if (!item.is_read) {
        void markAsRead(item.id).then((result) => {
          if (result?.success) onChanged?.();
        });
      }
      router.push(targetPath);
      return;
    }

    if (!item.is_read) {
      void markAsRead(item.id).then((result) => {
        if (result?.success) onChanged?.();
      });
    }
  }

  function handleRespond(decision) {
    const formData = new FormData();
    formData.append("requestId", item.link_uuid || item.link);
    formData.append("decision", decision);

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel:
          decision === "accept"
            ? "Accepting request..."
            : "Declining request...",
        successLabel:
          decision === "accept" ? "Request accepted." : "Request declined.",
        errorLabel: "Failed to respond to request.",
        action: respondToSupervisorRequest,
        formData,
      });

      if (result?.success) {
        setRespondedOverride(false);
        onChanged?.();
      }
    });
  }

  function handleDelete(e) {
    e.stopPropagation();

    const formData = new FormData();
    formData.append("notificationId", item.id);

    startDeleteTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Deleting notification...",
        successLabel: "Notification deleted.",
        errorLabel: "Failed to delete notification.",
        action: deleteNotification,
        formData,
      });
      if (result?.success) onChanged?.();
    });
  }

  return (
    <div
      onClick={handleOpen}
      className={cx(
        "relative flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
        item.is_read
          ? "border-border bg-background"
          : "border-primary-200 bg-primary-50/40",
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
          <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => handleRespond("accept")}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <Check className="size-3.5" /> Accept
            </button>
            <button
              type="button"
              onClick={() => handleRespond("reject")}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary disabled:opacity-50"
            >
              <X className="size-3.5" /> Decline
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="Delete notification"
        title="Delete notification"
        className="absolute right-3 top-3 text-muted-foreground/60 transition hover:text-destructive disabled:opacity-50"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export default NotificationItem;
