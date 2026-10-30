"use client";
import ModalForm, { controlClass } from "@/components/ui/ModalForm";
import { useState } from "react";
import DeleteForm from "../ui/DeleteForm";
import { useUser } from "@/contexts/UserContext";

function AnnouncementForm({
  handleAction,
  isPending,
  data = null,
  type = "",
  categories = null,
  announcementId = null,
  is_pinned = null,
}) {
  if (type === "create" || type === "edit") {
    return (
      <CreateUpdateAnnouncementForm
        handleAction={handleAction}
        type={type}
        isPending={isPending}
        categories={categories}
        data={data}
      />
    );
  }

  if (type === "pin") {
    return (
      <TogglePinAnnouncementForm
        announcementId={announcementId}
        isPending={isPending}
        is_pinned={is_pinned}
        handleAction={handleAction}
      />
    );
  }

  if (type === "delete") {
    return (
      <DeleteForm
        handleAction={handleAction}
        isPending={isPending}
        id={announcementId}
        name="announcementId"
      />
    );
  }
}

function CreateUpdateAnnouncementForm({
  handleAction,
  type,
  isPending,
  categories,
  data = null,
}) {
  const isEdit = type === "edit";
  const { user } = useUser();
  // Posting choices differ from reading: ordinary heads post Department, registrar
  // heads/admin post General. The backend enforces the same rule on create and edit.
  const categoryName = user?.role === "admin" || (user?.role === "department_head" && user?.department_code === "REG")
    ? "General" : user?.role === "department_head" ? "Department" : null;
  // Match by name and use the real database ID, including when categories
  // arrive after the form mounts. The category is fixed by the account role.
  const selectedCategory = (categories || []).find((category) => category.name === categoryName)?.id ?? "";
  const [eventDate, setEventDate] = useState(isEdit ? data.event_date?.slice(0, 10) || "" : "");
  const [eventEndDate, setEventEndDate] = useState(isEdit ? data.event_end_date?.slice(0, 10) || "" : "");

  return (
    <ModalForm.Root action={handleAction}>
      {isEdit && <input type="hidden" name="id" defaultValue={data.id} />}

      <ModalForm.Section title="Announcement Details">
        <input type="hidden" name="visible_to_employers" value="0" />
        <label className="flex items-start gap-3 rounded-lg border border-border p-3">
          <input type="checkbox" name="visible_to_employers" value="1" defaultChecked={isEdit && Number(data?.visible_to_employers) === 1} disabled={isPending} className="mt-1 size-4 shrink-0 accent-primary" />
          <span className="min-w-0"><span className="block text-sm font-medium">Visible to employers</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">Also share this announcement with all employer accounts. Leave unchecked to keep the usual school audience.</span></span>
        </label>
        <ModalForm.Row>
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-medium leading-5 text-foreground-soft">
              Title
            </span>
            <ModalForm.Input
              type="text"
              name="title"
              placeholder="Title of your announcement..."
              defaultValue={isEdit ? data.title : ""}
              disabled={isPending}
              required
            />
          </label>

          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-medium leading-5 text-foreground-soft">
              Categories
            </span>
            <input
              type="hidden"
              name="category_id"
              required
              data-validation-label="Category"
              className="pointer-events-none cursor-not-allowed"
              value={selectedCategory}
              disabled={isPending}
            />

            <div className={`${controlClass} flex items-center text-foreground-subtle`}>
              {categoryName || "Unavailable"}
            </div>
          </label>
        </ModalForm.Row>

        <ModalForm.Row>
          <ModalForm.Field label="Event date (optional)">
            <ModalForm.Input
              type="date"
              name="event_date"
              value={eventDate}
              onChange={(event) => {
                const next = event.target.value;
                setEventDate(next);
                if (!next) setEventEndDate("");
              }}
              disabled={isPending}
            />
          </ModalForm.Field>
          <ModalForm.Field label="Until date (optional)">
            <ModalForm.Input
              type="date"
              name="event_end_date"
              value={eventEndDate}
              min={eventDate || undefined}
              onChange={(event) => setEventEndDate(event.target.value)}
              disabled={isPending || !eventDate}
            />
          </ModalForm.Field>
        </ModalForm.Row>
        <p className="text-xs text-foreground-subtle">
          Leave Until date blank for a one-day event. A range includes both the event date and the until date.
        </p>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium leading-5 text-foreground-soft">
            Content
          </span>
          <ModalForm.Textarea
            name="content"
            placeholder="Write your announcement here..."
            className="min-h-28 sm:min-h-40"
            defaultValue={isEdit ? data.content : ""}
            disabled={isPending}
            required
          />
        </label>
      </ModalForm.Section>

      <ModalForm.Actions isPending={isPending} submitLabel={isEdit ? "Update" : "Post"} />
    </ModalForm.Root>
  );
}

function TogglePinAnnouncementForm({
  handleAction,
  announcementId,
  isPending,
  is_pinned,
}) {
  return (
    <ModalForm.Root action={handleAction}>
      <input
        type="hidden"
        name="announcementId"
        defaultValue={announcementId}
        className="pointer-events-none cursor-not-allowed"
      />

      <input
        type="hidden"
        name="is_pinned"
        defaultValue={is_pinned > 0 ? 0 : 1}
        className="pointer-events-none cursor-not-allowed"
      />

      <ModalForm.Confirmation>
        This announcement will be {is_pinned > 0 ? "unpinned" : "pinned"} for its audience.
      </ModalForm.Confirmation>
      <ModalForm.Actions isPending={isPending} submitLabel="Save" />
    </ModalForm.Root>
  );
}

export default AnnouncementForm;
