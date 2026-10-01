"use client";

import Link from "next/link";
import { ArrowUpRight, BellRing } from "lucide-react";
import { toast } from "sonner";

function NotificationToast({ title, message, onOpen }) {
  return (
    <Link
      href="/notifications"
      onClick={onOpen}
      className="group relative flex w-[min(92vw,390px)] overflow-hidden rounded-2xl border border-primary-200 bg-card p-4 text-left text-foreground shadow-[0_18px_50px_-20px_rgba(55,15,15,0.5)] outline-none transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_55px_-18px_rgba(55,15,15,0.55)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`${title}. Open notifications`}
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden="true" />
      <span className="notification-toast-icon relative ml-1 mr-3 grid size-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-emphasis" aria-hidden="true">
        <BellRing className="size-5" strokeWidth={2.25} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-600">
          New notification
          <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
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
          View notifications <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </span>
    </Link>
  );
}

export function showNotificationToast(data) {
  const title = typeof data?.title === "string" && data.title.trim()
    ? data.title.trim()
    : "New notification";
  const message = typeof data?.message === "string" ? data.message : "";

  toast.custom(
    (id) => (
      <NotificationToast
        title={title}
        message={message}
        onOpen={() => toast.dismiss(id)}
      />
    ),
    { position: "top-right", duration: 7000, unstyled: true },
  );
}
