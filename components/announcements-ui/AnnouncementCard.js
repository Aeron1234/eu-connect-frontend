"use client";

import { format } from "date-fns";
import { formatCompactEventDateRange, formatEventDateRange } from "@/lib/announcement-event-dates.mjs";
import { Calendar, CalendarDays, Pencil, Pin, Trash2, Users } from "lucide-react";
import Modal from "../ui/Modal";
import AnnouncementTogglePin from "./AnnouncementTogglePin";
import AnnouncementUpdate from "./AnnouncementUpdate";
import AnnouncementDelete from "./AnnouncementDelete";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function getTaggedStudents(value) {
  try {
    const students = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(students)
      ? students.filter((student) => typeof student?.name === "string" && student.name.trim())
      : [];
  } catch {
    return [];
  }
}

function AnnouncementCard({ announcement, categories = null, onChanged, highlighted = false }) {
  const {
    id: announcementId,
    author_id,
    role,
    title,
    content,
    is_pinned,
    created_at,
    event_date,
    event_end_date,
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
  const canManage = ["department_head", "admin"].includes(userRole) && (isAuthor || userRole === "admin");
  const showDepartment = category === "Department" && ["employer", "admin"].includes(userRole);
  const departmentLabel = announcement.author_department_name
    ? `${announcement.author_department_name}${announcement.author_department_code ? ` (${announcement.author_department_code})` : ""}`
    : announcement.author_department_code || "-";
  const isPinned = Boolean(is_pinned);
  const previewRef = useRef(null);
  const [isContentClipped, setIsContentClipped] = useState(false);
  const [showAllTaggedStudents, setShowAllTaggedStudents] = useState(false);
  const taggedStudents = getTaggedStudents(announcement.tagged_students);
  const visibleTaggedStudents = showAllTaggedStudents ? taggedStudents : taggedStudents.slice(0, 3);

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
      className={`rounded-xl border p-4 shadow-sm transition-[border-color,box-shadow] ${highlighted ? "duration-150" : "duration-[1800ms]"} ease-out motion-reduce:transition-none sm:p-5 ${
        isPinned ? "bg-primary" : "bg-card"
      } ${highlighted ? "border-primary ring-4 ring-primary/50" : isPinned ? "border-primary" : "border-border"}`}
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
                <Modal variant="confirmation"
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
                  <Modal variant="form"
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

                <Modal variant="confirmation"
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
        {Number(announcement.tagged_students_only) === 1 && <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isPinned ? 'bg-white/15 text-white' : 'bg-primary/10 text-primary-emphasis'}`}>Tagged students only</span>}
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: color, color: text_color }}
        >
          {category}
        </span>
        {showDepartment && <span className={`min-w-0 break-words text-xs ${isPinned ? "text-white/80" : "text-muted-foreground"}`}>Department: {departmentLabel}</span>}
        {canManage && Number(announcement.visible_to_employers) === 1 && <span className={`text-xs ${isPinned ? "text-white/80" : "text-muted-foreground"}`}>{Number(announcement.employer_tagged_only) === 1 ? "Visible to supervisors of tagged students" : "Also visible to all employers"}</span>}
        <time
          dateTime={created_at}
          className={`inline-flex items-center gap-1 text-xs ${isPinned ? "text-white/80" : "text-muted-foreground"}`}
        >
          <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
          Posted {format(new Date(created_at), "MMM d, yyyy")}
        </time>
      </div>

      {taggedStudents.length > 0 && (
        <div className={`mt-3 flex items-start gap-2 text-xs ${isPinned ? "text-white/90" : "text-muted-foreground"}`}>
          <Users className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <span className="font-semibold">Tagged students: </span>
            {visibleTaggedStudents.map((student, index) => (
              <span key={student.id}>
                {index > 0 && ", "}
                <Link
                  href={`/users/${student.id}`}
                  className={`font-medium transition-colors hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${isPinned ? "text-white hover:text-primary-200 focus-visible:text-primary-200" : "text-foreground hover:text-primary-emphasis focus-visible:text-primary-emphasis"}`}
                >
                  {student.name.trim()}
                </Link>
              </span>
            ))}
            {taggedStudents.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllTaggedStudents((current) => !current)}
                aria-expanded={showAllTaggedStudents}
                className={`ml-1 font-semibold underline underline-offset-2 ${isPinned ? "text-white" : "text-primary-emphasis"}`}
              >
                {showAllTaggedStudents ? "Show fewer" : `Show all ${taggedStudents.length}`}
              </button>
            )}
          </div>
        </div>
      )}

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
          triggerStyles={`mt-2 block w-fit text-left text-xs font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${isPinned ? "text-white" : "text-primary-emphasis"}`}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: color, color: text_color }}
              >
                {category}
              </span>
              {showDepartment && <span className="min-w-0 break-words text-xs text-muted-foreground">Department: {departmentLabel}</span>}
              <time dateTime={created_at} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3.5" aria-hidden="true" />
                Posted {format(new Date(created_at), "MMM d, yyyy")}
              </time>
              {event_date && (
                <time dateTime={event_date} className="inline-flex items-start gap-1 text-[10px] font-normal leading-relaxed text-muted-foreground sm:text-xs">
                  <CalendarDays className="mt-0.5 size-3 shrink-0 sm:size-3.5" aria-hidden="true" />
                  Event {formatCompactEventDateRange(event_date, event_end_date)}
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
          className={`mt-3 inline-flex max-w-full items-start gap-1.5 rounded-md border px-2 py-1 text-[10px] font-normal leading-relaxed sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-xs sm:font-semibold ${
            isPinned
              ? "border-white/30 bg-white/15 text-white"
              : "border-primary/20 bg-primary/5 text-primary-emphasis"
          }`}
        >
          <CalendarDays className="mt-0.5 size-3 shrink-0 sm:size-3.5" aria-hidden="true" />
          <span className="min-w-0 break-words">
            {event_end_date && event_end_date !== event_date ? "Event dates: " : "Event date: "}
            <span className="sm:hidden">{formatCompactEventDateRange(event_date, event_end_date)}</span>
            <span className="hidden sm:inline">{formatEventDateRange(event_date, event_end_date, "MMMM d, yyyy")}</span>
          </span>
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
