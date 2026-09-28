"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Award,
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
import { toastAndAction } from "../../lib/helpers";
import {
  markAsRead,
  deleteNotification,
} from "@/lib/server-actions/notifications-actions";
import { respondToSupervisorRequest } from "@/lib/server-actions/supervisor-actions";

const TYPE_META = {
  announcement: { icon: Megaphone, tone: "primary" },
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
  primary: "bg-primary-500/10 text-primary-500",
  success: "bg-emerald-50 text-emerald-600",
  destructive: "bg-red-50 text-red-600",
  muted: "bg-secondary text-muted-foreground",
};

// Where clicking a notification of this type should navigate. Types not
// listed here just mark-as-read on click without navigating anywhere.
const TYPE_ROUTES = {
  announcement: "/announcements",
  internship_record_request: "/internship-records",
  internship_record_rejected: "/student/internship-record",
  evaluation_submitted: "/student/evaluations?filter=pending-confirmation",
  certificate_uploaded: "/student/storage",
};

// internship_record_request needs the specific record id appended — every
// other routed type just goes to a flat page.
function getTargetPath(item, route) {
  if (!route) return null;
  if (item.type === "internship_record_request") {
    return item.link_uuid ? `${route}/${item.link_uuid}` : null;
  }
  return route;
}

function NotificationItem({ item, notifications, setNotifications }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  // Nullable override: null = trust item.actionable as it comes in from
  // props (so a fresh fetch or revalidation always reflects the current
  // server state); false = force-hidden immediately after THIS employer
  // just responded, before the next revalidation confirms it server-side.
  // Plain useState(item.actionable) goes stale here because NotificationItem
  // keeps the same key (item.ui_key) across re-renders even when the
  // underlying actionable status changes, so its initial value never re-runs.
  const [respondedOverride, setRespondedOverride] = useState(null);
  const isActionable = respondedOverride === false ? false : item.actionable;

  // If the request gets superseded/resolved elsewhere (another tab, another
  // device) and a fresh item.actionable === false comes down through props,
  // drop any stale local override so we don't keep hiding something that's
  // already resolved for a different reason than "I just clicked a button".
  useEffect(() => {
    if (!item.actionable) setRespondedOverride(null);
  }, [item.actionable]);

  const meta = TYPE_META[item.type] ?? { icon: FileText, tone: "muted" };
  const Icon = meta.icon;
  const route = TYPE_ROUTES[item.type];
  const isClickable = !isActionable && (!item.is_read || Boolean(route));

  function updateItem(patch) {
    setNotifications(
      notifications.map((n) => (n.id === item.id ? { ...n, ...patch } : n)),
    );
  }

  function handleOpen() {
    if (isActionable) return;

    const targetPath = getTargetPath(item, route);

    if (targetPath) {
      // Skip the optimistic local re-render here — this page is about to
      // be unmounted by the navigation anyway, so there's nothing to
      // visually update. Mutating this card's DOM node (via updateItem)
      // in the same tick as router.push is what causes Next's "Cannot
      // read properties of undefined (reading 'startTime')" crash — a
      // known web-vitals/INP timing bug when the clicked element gets
      // removed before its interaction entry finishes being read.
      if (!item.is_read) markAsRead(item.id);
      router.push(targetPath);
      return;
    }

    if (!item.is_read) {
      // Optimistic — don't block the UI on this, and don't toast it; marking
      // read is background housekeeping, not an action worth interrupting
      // for. markAsRead already calls revalidatePath("/notifications") on
      // success, which the list's merge effect will pick up on its own.
      updateItem({ is_read: true });
      markAsRead(item.id);
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
        updateItem({ is_read: true });
      }
    });
  }

  function handleDelete(e) {
    e.stopPropagation();

    const formData = new FormData();
    formData.append("notificationId", item.id);

    // Optimistic: remove immediately, keep the full previous list so a
    // failed delete can be rolled back exactly, not just re-inserted
    // somewhere approximate.
    const previousNotifications = notifications;
    setNotifications(notifications.filter((n) => n.id !== item.id));

    startDeleteTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Deleting notification...",
        successLabel: "Notification deleted.",
        errorLabel: "Failed to delete notification.",
        action: deleteNotification,
        formData,
      });

      if (!result?.success) {
        setNotifications(previousNotifications);
      }
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
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary-500" />
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
              className="inline-flex items-center gap-1.5 rounded-md bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
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
