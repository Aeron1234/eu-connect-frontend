"use client";

import { format } from "date-fns";
import { Calendar, CalendarDays, Pencil, Pin, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import AnnouncementTogglePin from "./AnnouncementTogglePin";
import AnnouncementUpdate from "./AnnouncementUpdate";
import AnnouncementDelete from "./AnnouncementDelete";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function AnnouncementCard({ announcement, categories = null, onChanged }) {
  const {
    id: announcementId,
    author_id,
    role,
    title,
    content,
    is_pinned,
    created_at,
    event_date,
    category,
    color,
    text_color,
    first_name,
    last_name,
  } = announcement;

  const { user } = useUser();
  const userId = user.id;
  const userRole = user.role;

  const isAuthor = userId === author_id;
  const canManage = isAuthor || userRole === "admin";
  const isPinned = Boolean(is_pinned);
  const previewRef = useRef(null);
  const [isContentClipped, setIsContentClipped] = useState(false);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    const measure = () => {
      setIsContentClipped(preview.scrollHeight > preview.clientHeight + 1);
    };
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(preview);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [content]);

  return (
    <article
      className={`rounded-xl border p-4 shadow-sm sm:p-5 ${
        isPinned ? "border-primary bg-primary" : "border-border bg-card"
      }`}
    >
      <div className="flex items-start gap-2.5 sm:gap-3">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${isPinned ? "bg-card text-primary-emphasis" : "bg-primary/10 text-primary-emphasis/50"}`}
        >
          <Pin className="size-4" />
        </div>
        <h3 className={`min-w-0 flex-1 break-words text-sm font-bold sm:text-base ${isPinned ? "text-white" : "text-foreground"}`}>
          {title}
        </h3>

        {(isPinned || canManage) && (
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {isPinned && (
              <span className="rounded-full bg-card px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-emphasis">
                Pinned
              </span>
            )}
            {canManage && (
              <div className={`flex items-center gap-1.5 ${isPinned ? "text-white" : "text-muted-foreground"}`}>
                <Modal
                  trigger={
                    <div
                      title="pin announcement"
                      className={`${isPinned ? "hover:text-primary-200" : "hover:text-primary-emphasis"} transition-all`}
                    >
                      <Pin className="h-4 w-4" />
                    </div>
                  }
                  title={`${!isPinned ? "Pin" : "Unpin"} announcement`}
                >
                  <AnnouncementTogglePin
                    announcementId={announcementId}
                    is_pinned={isPinned}
                    onChanged={onChanged}
                  />
                </Modal>

                {isAuthor && (
                  <Modal
                    trigger={
                      <div
                        title="update announcement"
                        className={`${isPinned ? "hover:text-primary-200" : "hover:text-primary-emphasis"} transition-all`}
                      >
                        <Pencil className="h-4 w-4" />
                      </div>
                    }
                    title="Update announcement"
                  >
                    <AnnouncementUpdate
                      data={announcement}
                      categories={categories}
                      onChanged={onChanged}
                    />
                  </Modal>
                )}

                <Modal
                  trigger={
                    <div
                      title="delete announcement"
                      className={`${isPinned ? "hover:text-destructive" : "hover:text-primary-emphasis"} transition-all`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </div>
                  }
                  title={<span className="text-red-600">Delete Announcement</span>}
                >
                  <AnnouncementDelete
                    announcementId={announcementId}
                    onChanged={onChanged}
                  />
                </Modal>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: color, color: text_color }}
        >
          {category}
        </span>
        <time
          dateTime={created_at}
          className={`inline-flex items-center gap-1 text-xs ${isPinned ? "text-white/80" : "text-muted-foreground"}`}
        >
          <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
          Posted {format(new Date(created_at), "MMM d, yyyy")}
        </time>
      </div>

      <p
        ref={previewRef}
        className={`mt-3 line-clamp-4 break-words whitespace-pre-wrap text-sm leading-relaxed sm:line-clamp-3 ${isPinned ? "text-white" : "text-muted-foreground"}`}
      >
        {content}
      </p>

      {isContentClipped && (
        <Modal
          title={title}
          trigger={<span>See more &rarr;</span>}
          triggerStyles={`mt-2 max-sm:block max-sm:w-fit text-left text-xs font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${isPinned ? "text-white" : "text-primary-emphasis"}`}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: color, color: text_color }}
              >
                {category}
              </span>
              <time dateTime={created_at} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3.5" aria-hidden="true" />
                Posted {format(new Date(created_at), "MMM d, yyyy")}
              </time>
              {event_date && (
                <time dateTime={event_date} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  Event {format(new Date(`${event_date}T00:00:00`), "MMM d, yyyy")}
                </time>
              )}
            </div>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
              {content}
            </p>
            <p className="border-t border-border pt-3 text-xs text-muted-foreground">
              Posted by{" "}
              <Link href={`/users/${author_id}`} className="font-semibold text-primary-emphasis hover:underline">
                {first_name} {last_name}
              </Link>
            </p>
          </div>
        </Modal>
      )}

      {event_date && (
        <time
          dateTime={event_date}
          className={`mt-3 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
            isPinned
              ? "border-white/30 bg-white/15 text-white"
              : "border-primary/20 bg-primary/5 text-primary-emphasis"
          }`}
        >
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Event date: {format(new Date(`${event_date}T00:00:00`), "MMMM d, yyyy")}
        </time>
      )}

      <div className={`mt-3 flex flex-wrap items-center gap-2 text-xs ${isPinned ? "text-white" : "text-foreground-soft"}`}>
        <span>Posted by</span>
        <Link
          href={`/users/${author_id}`}
          className={`font-bold hover:underline ${isPinned ? "text-white" : "text-primary-emphasis"}`}
        >
          {first_name} {last_name}
        </Link>
        {(role === "admin" || role === "department_head") && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isPinned ? "bg-white/15 text-white" : "bg-primary text-white"}`}>
            {role === "admin" ? "Admin" : "Department Head"}
          </span>
        )}
      </div>
    </article>
  );
}

export default AnnouncementCard;
