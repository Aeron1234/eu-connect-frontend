"use client";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
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
    <form action={handleAction} className="flex-1 flex flex-col gap-4">
      {isEdit && <input type="hidden" name="id" defaultValue={data.id} />}

      <div className="flex gap-4 flex-1 max-sm:flex-col">
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-semibold text-muted-foreground">
            Title
          </span>
          <input
            type="text"
            name="title"
            placeholder="Title of your announcement..."
            className="p-2 border border-border rounded-sm text-sm"
            defaultValue={isEdit ? data.title : ""}
            disabled={isPending}
            required
          />
        </label>

        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-semibold text-muted-foreground">
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
            <div className="h-9.5 px-3 flex items-center text-sm w-full rounded-sm border border-border bg-muted/50 text-muted-foreground">
              General
            </div>
          ) : (
            <Select
              className="w-full h-full "
              onValueChange={setSelectedCategory}
              disabled={isPending}
              defaultValue={isEdit ? `${data.category_id}` : undefined}
            >
              <SelectTrigger className="h-9.5 px-3 text-sm w-full rounded-sm border border-border focus:ring-2 focus:ring-ring focus:border-transparent">
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
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-muted-foreground">
          Content
        </span>
        <textarea
          name="content"
          placeholder="Write your announcement here..."
          className="px-2 py-1 border border-border rounded-sm min-h-40 overflow-y-auto resize-none text-sm"
          defaultValue={isEdit ? data.content : ""}
          disabled={isPending}
          required
        />
      </label>

      <DialogFooter>
        <div className="flex gap-2 font-semibold w-full justify-end">
          <DialogClose asChild>
            <Button variant="outline" className={"w-fit"}>
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              className={`bg-primary hover:bg-primary-400 w-fit ${isPending ? "pointer-events-none opacity-50" : ""} `}
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
              ) : type === "edit" ? (
                "Update"
              ) : (
                "Post"
              )}
            </Button>
          </DialogClose>
        </div>
      </DialogFooter>
    </form>
  );
}

function TogglePinAnnouncementForm({
  handleAction,
  announcementId,
  isPending,
  is_pinned,
}) {
  return (
    <form action={handleAction}>
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

      <DialogFooter>
        <div className="flex gap-2 font-semibold w-full justify-end">
          <DialogClose asChild>
            <Button variant="outline" className={"w-fit"}>
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              className={"bg-primary hover:bg-primary-400 w-fit "}
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
              ) : (
                "Save"
              )}
            </Button>
          </DialogClose>
        </div>
      </DialogFooter>
    </form>
  );
}

export default AnnouncementForm;
