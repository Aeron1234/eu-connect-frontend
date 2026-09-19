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
import { toastAndAction, useFavoriteToggle } from "../_services/helpers";
import {
  deleteInternshipPosting,
  updateInternshipPosting,
} from "../_services/employer-actions";
import InternshipPostForm from "./InternshipPostForm";
import { toggleInternshipFavorite } from "../_services/student-actions";

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

function InternshipPostsList({ item, userRole, courses, onUpdate, onDelete }) {
  const [isPending, startTransition] = useTransition();
  const { isFavorited, toggle: toggleFavorite } = useFavoriteToggle(
    item.id,
    item.isFavorited,
    toggleInternshipFavorite,
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
    <article
      key={item.id}
      className="rounded-xl border border-border bg-background p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500 text-xs font-bold">
            {companyNameInitials(item.company_name)}
          </span>
          <div className="min-w-0">
            <h2 className="flex flex-wrap items-center gap-2 font-display text-lg font-bold">
              {item.position}
              {item.isOwner && (
                <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary-500">
                  My Post
                </span>
              )}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {item.company_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${workTypeStyles[item.work_type]}`}
          >
            {item.work_type}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-foreground/80">
            <Users className="h-4 w-4 text-muted-foreground" /> {item.vacancies}{" "}
            vacancies
          </span>

          <div className="flex items-center gap-3">
            {canEdit && (
              <Modal
                trigger={
                  <div
                    aria-label={`Edit ${item.title}`}
                    className="text-muted-foreground hover:text-primary-500"
                  >
                    <Pencil className="h-4 w-4" />
                  </div>
                }
                title={
                  <span className={`text-primary-500`}>
                    Update internship post
                  </span>
                }
                description={`Are you sure you want to delete this post?`}
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
                    aria-label={`Delete ${item.title}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </div>
                }
                title={
                  <span className={`text-primary-500`}>
                    Delete internship post
                  </span>
                }
                description={`Are you sure you want to delete this post?`}
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

          {!item.isOwner && userRole === "student" && (
            <button
              type="button"
              onClick={toggleFavorite}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                isFavorited
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-primary-500 text-primary-foreground hover:bg-primary-500-deep"
              }`}
            >
              {isFavorited && <Check className="h-3.5 w-3.5" />}
              {isFavorited ? "Favorite" : "Mark as Favorite"}
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm text-foreground/80">{item.description}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> {item.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {item.duration_hours} hours
          </span>
          {item.courses.length > 0 ? (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground/70">Course:</span>{" "}
              <ul className="flex gap-1.5">
                {item.courses.map((c) => (
                  <li key={c.id} className="p-1 bg-stone-100 rounded-lg">
                    {c.shortName}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <span>Posted {format(new Date(item.created_at), "mm-dd-yyyy")}</span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-foreground/70">
          Requirements:
        </p>
        <ul className="mt-2 space-y-1.5 list-inside">
          {item.requirements.split("\n").map((r, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-foreground/80"
            >
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs font-semibold text-muted-foreground">
          Contact Details:
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="font-medium">{item.contact_name}</span>
          <a
            href={`mailto:${item.contact_email}`}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-500"
          >
            <Mail className="h-3.5 w-3.5" /> {item.contact_email}
          </a>
          <a
            href={`tel:${item.contact_phone.replace(/[^\d+]/g, "")}`}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-500"
          >
            <Phone className="h-3.5 w-3.5" /> {item.contact_phone}
          </a>
          <a
            href={`https://${item.contact_website}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-500"
          >
            <Globe className="h-3.5 w-3.5" /> {item.contact_website}
          </a>
        </div>
      </div>
    </article>
  );
}

export default InternshipPostsList;
