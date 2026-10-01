"use client";

import { format } from "date-fns";
import {
  Check,
  Clock,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  Users,
} from "lucide-react";
import Modal from "./Modal";
import { useTransition } from "react";
import DeleteForm from "./DeleteForm";
import { toastAndAction, useFavoriteToggle } from "../../lib/helpers";
import {
  deleteInternshipPosting,
  updateInternshipPosting,
} from "@/lib/server-actions/internship-posts-actions";
import InternshipPostForm from "./InternshipPostForm";
import { toggleInternshipFavorite } from "@/lib/server-actions/internship-posts-actions";

const workTypeStyles = {
  "on-site": "border-sky-200 bg-sky-50 text-sky-700",
  hybrid: "border-violet-200 bg-violet-50 text-violet-700",
  remote: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function companyNameInitials(companyName) {
  const splitted = companyName.split(" ");
  let initials = splitted.map((s) => s.charAt(0)).join("");

  return initials.length < 2
    ? initials.toLocaleUpperCase()
    : initials.slice(0, 3).toLocaleUpperCase();
}

function InternshipPostsList({ item, userRole, courses, onUpdate, onDelete, onFavoriteSettled }) {
  const [isPending, startTransition] = useTransition();
  const { isFavorited, toggle: toggleFavorite } = useFavoriteToggle(
    item.id,
    item.isFavorited,
    toggleInternshipFavorite,
    onFavoriteSettled,
  );

  function handleDelete(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Deleting post...",
        successLabel: "Post deleted.",
        errorLabel: "Failed to delete post.",
        action: deleteInternshipPosting,
        formData,
      });

      if (result?.success) {
        onDelete?.();
      }
    });
  }

  function handleUpdate(formData) {
    formData.append("postingId", item.id);

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Updating post...",
        successLabel: "Post updated.",
        errorLabel: "Failed to update post.",
        action: updateInternshipPosting,
        formData,
      });

      if (result?.success) {
        onUpdate?.(result.data ?? { ...item, ...Object.fromEntries(formData) });
      }
    });
  }

  const canDelete = item.isOwner || userRole === "admin";
  const canEdit = item.isOwner;

  return (
    <article className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
      {/* Header row: avatar + title/company, edit/delete pinned top-right */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-emphasis text-xs font-bold">
            {companyNameInitials(item.company_name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold sm:font-bold text-foreground">
                {item.position}
              </h2>
              {item.isOwner && (
                <span className="rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-600">
                  My Post
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{item.company_name}</p>
          </div>
        </div>

        {(canEdit || canDelete) && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {canEdit && (
              <Modal
                trigger={
                  <div
                    aria-label={`Edit ${item.position}`}
                    className="p-1.5 rounded-md text-foreground-subtle hover:bg-muted hover:text-primary-emphasis transition-colors cursor-pointer"
                  >
                    <Pencil className="h-4 w-4" />
                  </div>
                }
                title={
                  <span className="text-primary-emphasis">
                    Update internship post
                  </span>
                }
                description="Update the details for this posting."
              >
                <InternshipPostForm
                  handleAction={handleUpdate}
                  isPending={isPending}
                  courses={courses}
                  type={"edit"}
                  data={item}
                />
              </Modal>
            )}
            {canDelete && (
              <Modal
                trigger={
                  <div
                    aria-label={`Delete ${item.position}`}
                    className="p-1.5 rounded-md text-foreground-subtle hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </div>
                }
                title={
                  <span className="text-primary-emphasis">
                    Delete internship post
                  </span>
                }
                description="Are you sure you want to delete this post?"
              >
                <DeleteForm
                  handleAction={handleDelete}
                  isPending={isPending}
                  name={"postingId"}
                  id={item.id}
                />
              </Modal>
            )}
          </div>
        )}
      </div>

      {/* Work type, vacancies, favorite — its own row so it always wraps cleanly */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${workTypeStyles[item.work_type]}`}
        >
          {item.work_type}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-foreground-soft">
          <Users className="h-4 w-4 text-foreground-subtle" /> {item.vacancies}{" "}
          vacancies
        </span>

        {!item.isOwner && userRole === "student" && (
          <button
            type="button"
            onClick={toggleFavorite}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              isFavorited
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                : "bg-primary text-white hover:bg-primary-600"
            }`}
          >
            {isFavorited && <Check className="h-3.5 w-3.5" />}
            {isFavorited ? "Favorite" : "Mark as Favorite"}
          </button>
        )}
      </div>

      <p className="mt-4 text-sm text-foreground">{item.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> {item.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> {item.duration_hours} hours
        </span>
        {item.courses.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-foreground-soft">Course:</span>
            {item.courses.map((c) => (
              <span
                key={c.id}
                className="rounded-md bg-muted px-2 py-0.5 text-foreground"
              >
                {c.shortName}
              </span>
            ))}
          </div>
        )}
        <span className="ml-0 sm:ml-auto">
          Posted {format(new Date(item.created_at), "MMM d, yyyy")}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-foreground-soft">Requirements:</p>
        <ul className="mt-2 space-y-1.5">
          {item.requirements.split("\n").map((r, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-stone-400" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs font-semibold text-muted-foreground">Contact Details:</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="font-medium text-foreground">
            {item.contact_name}
          </span>
          <a
            href={`mailto:${item.contact_email}`}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-emphasis transition-colors"
          >
            <Mail className="h-3.5 w-3.5" /> {item.contact_email}
          </a>
          <a
            href={`tel:${item.contact_phone.replace(/[^\d+]/g, "")}`}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-emphasis transition-colors"
          >
            <Phone className="h-3.5 w-3.5" /> {item.contact_phone}
          </a>

          <a
            href={`https://${item.contact_website}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-emphasis transition-colors"
          >
            <Globe className="h-3.5 w-3.5" /> {item.contact_website}
          </a>
        </div>
      </div>
    </article>
  );
}

export default InternshipPostsList;
