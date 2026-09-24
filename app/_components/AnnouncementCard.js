"use client";

import { format } from "date-fns";
import { Calendar, Pencil, Pin, Trash2 } from "lucide-react";
import Modal from "./Modal";
import AnnouncementTogglePin from "./AnnouncementTogglePin";
import AnnouncementUpdate from "./AnnouncementUpdate";
import AnnouncementDelete from "./AnnouncementDelete";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";

function AnnouncementCard({ announcement, categories = null, onChanged }) {
  const {
    id: announcementId,
    author_id,
    role,
    title,
    content,
    is_pinned,
    created_at,
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

  return (
    <div
      className={`rounded-xl border shadow-sm p-5 ${
        isPinned
          ? "bg-primary-500 border-primary-500"
          : "bg-white border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex size-9 flex-shrink-0 items-center justify-center rounded-lg ${isPinned ? "bg-white text-primary-500" : "bg-primary-500/10 text-primary-500/50"}`}
        >
          <Pin className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`${isPinned ? "text-white" : "text-foreground"} text-base font-bold `}
            >
              {title}
            </h3>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: color, color: text_color }}
            >
              {category}
            </span>
          </div>

          <p
            className={`mt-1.5 text-sm leading-relaxed text-wrap wrap-break-word ${isPinned ? "text-white" : "text-muted-foreground"}`}
          >
            {content}
          </p>

          <div
            className={`mt-3 flex flex-wrap items-center gap-2 text-xs ${isPinned ? "text-white" : "text-stone-600"}`}
          >
            <span>Posted by</span>
            <Link
              href={`/users/${author_id}`}
              className={`inline font-bold hover:underline ${isPinned ? "text-white" : "text-primary-500"}`}
            >
              {first_name} {last_name}
            </Link>
            {(role === "admin" || role === "department_head") && (
              <span className="rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {role === "admin" ? "Admin" : "Department Head"}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {format(new Date(created_at), "MMMM dd, yyyy")}
            </span>
          </div>
        </div>

        {/* Ribbon and action icons share a vertical column instead of the
            ribbon being absolutely positioned over the icons — that overlap
            was what made this cramped/ugly for the author's own pinned post. */}
        {(isPinned || canManage) && (
          <div className="flex flex-shrink-0 flex-col items-end gap-2">
            {isPinned && (
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-500">
                Pinned
              </span>
            )}

            {canManage && (
              <div
                className={`flex items-center gap-2.5 ${isPinned ? "text-white" : "text-foreground-muted"}`}
              >
                <Modal
                  trigger={
                    <div
                      title="pin announcement"
                      className={`${isPinned ? "hover:text-primary-200" : "hover:text-primary-500"} transition-all`}
                    >
                      <Pin className="h-4 w-4" />
                    </div>
                  }
                  title={`${!isPinned ? "Pin" : "Unpin"} announcement`}
                  description={`Announcement will be ${!isPinned ? "pinned" : "unpinned"} for all the users.`}
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
                        className={`${isPinned ? "hover:text-primary-200" : "hover:text-primary-500"} transition-all`}
                      >
                        <Pencil className="h-4 w-4" />
                      </div>
                    }
                    title="Update announcement"
                    description="Do you want to change something?"
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
                      className={`${isPinned ? "hover:text-destructive" : "hover:text-primary-500"} transition-all`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </div>
                  }
                  title={
                    <span className="text-red-600">Delete Announcement</span>
                  }
                  description="Are you sure you want to delete this announcement?"
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
    </div>
  );
}

export default AnnouncementCard;
