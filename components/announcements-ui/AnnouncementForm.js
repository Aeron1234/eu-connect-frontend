"use client";
import ModalForm, { controlClass } from "@/components/ui/ModalForm";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const isAdmin = user?.role === "admin";

  // Admin can only ever post/edit General-category announcements — find
  // that category's real id from whatever the backend returned, rather
  // than hardcoding "1" and hoping the seed data never changes.
  const generalCategory = categories?.find((c) => c.name === "General");

  const [selectedCategory, setSelectedCategory] = useState(
    isAdmin
      ? generalCategory
        ? `${generalCategory.id}`
        : ""
      : isEdit
        ? `${data.category_id}`
        : "",
  );

  return (
    <ModalForm.Root action={handleAction}>
      {isEdit && <input type="hidden" name="id" defaultValue={data.id} />}

      <ModalForm.Section title="Announcement Details">
        <ModalForm.Row>
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-xs font-semibold tracking-wide text-foreground-soft">
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

          <label className="flex flex-col gap-1 flex-1">
            <span className="text-xs font-semibold tracking-wide text-foreground-soft">
              Categories
            </span>
            <input
              type="hidden"
              name="category_id"
              className="pointer-events-none cursor-not-allowed"
              value={selectedCategory}
              disabled={isPending}
            />

            {isAdmin ? (
              // Admin has no department, so Department-category is never a
              // valid choice — no picker at all, just a locked display.
              <div className="mt-1 flex min-h-11 w-full items-center rounded-xl border border-border/80 bg-muted/40 px-3 text-sm text-muted-foreground sm:mt-1.5 sm:px-3.5">
                General
              </div>
            ) : (
              <Select
                className="w-full h-full "
                onValueChange={setSelectedCategory}
                disabled={isPending}
                defaultValue={isEdit ? `${data.category_id}` : undefined}
              >
                <SelectTrigger className={controlClass}>
                  <SelectValue placeholder={"Select category"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {categories.length > 0
                      ? categories.map((category) => (
                          <SelectItem key={category.id} value={`${category.id}`}>
                            {category.name}
                          </SelectItem>
                        ))
                      : null}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </label>
        </ModalForm.Row>

        <ModalForm.Field label="Event date (optional)">
          <ModalForm.Input
            type="date"
            name="event_date"
            defaultValue={isEdit ? data.event_date?.slice(0, 10) || "" : ""}
            disabled={isPending}
          />
        </ModalForm.Field>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold tracking-wide text-foreground-soft">
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
        This announcement will be {is_pinned > 0 ? "unpinned" : "pinned"} for all users.
      </ModalForm.Confirmation>
      <ModalForm.Actions isPending={isPending} submitLabel="Save" />
    </ModalForm.Root>
  );
}

export default AnnouncementForm;
