"use client";

import Link from "next/link";
import { ArrowUpRight, BellRing, X } from "lucide-react";
import { toast } from "sonner";

function NotificationToast({ title, message, onOpen, onDismiss }) {
  return (
    <div
      className="group relative flex w-[min(92vw,390px)] overflow-hidden rounded-2xl border border-primary-200 bg-card text-left text-foreground shadow-[0_18px_50px_-20px_rgba(55,15,15,0.5)] outline-none transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_55px_-18px_rgba(55,15,15,0.55)]"
    >
      <Link
        href="/notifications"
        onClick={onOpen}
        aria-label={`${title}. Open notifications`}
        className="flex min-w-0 flex-1 p-4 pr-12 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <span
          className="absolute inset-y-0 left-0 w-1 bg-primary"
          aria-hidden="true"
        />
        <span
          className="notification-toast-icon relative ml-1 mr-3 grid size-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-emphasis"
          aria-hidden="true"
        >
          <BellRing className="size-5" strokeWidth={2.25} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-600">
            New notification
            <span
              className="size-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
          </span>
          <span className="mt-1 block line-clamp-1 text-sm font-bold leading-snug text-foreground">
            {title}
          </span>
          {message && (
            <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-foreground-soft">
              {message}
            </span>
          )}
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 group-hover:underline">
            View notifications{" "}
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification popup"
        title="Dismiss notification popup"
        className="absolute right-2 top-2 grid size-8 place-items-center rounded-lg text-foreground-soft transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function showNotificationToast(data) {
  const title =
    typeof data?.title === "string" && data.title.trim()
      ? data.title.trim()
      : "New notification";
  const message = typeof data?.message === "string" ? data.message : "";

  toast.custom(
    (id) => (
      <NotificationToast
        title={title}
        message={message}
        onOpen={() => toast.dismiss(id)}
        // Dismiss only this popup; the saved notification stays unread in the inbox.
        onDismiss={() => toast.dismiss(id)}
      />
    ),
    { position: "top-right", duration: 7000, unstyled: true },
  );
}
