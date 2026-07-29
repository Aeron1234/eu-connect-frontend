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
import DeleteForm from "./DeleteForm";

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
  const [selectedCategory, setSelectedCategory] = useState(
    isEdit ? `${data.category_id}` : "",
  );

  return (
    <form action={handleAction} className="flex-1 flex flex-col gap-4">
      <div className="flex gap-4 flex-1 max-sm:flex-col">
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-semibold text-stone-500">Title</span>
          <input
            type="text"
            name="title"
            placeholder="Title of your announcement..."
            className="p-2 border border-stone-300 rounded-sm text-sm"
            defaultValue={isEdit ? data.title : ""}
            disabled={isPending}
            required
          />
        </label>

        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-semibold text-stone-500">
            Categories
          </span>
          <input
            type="hidden"
            name="category_id"
            className="pointer-events-none cursor-not-allowed"
            value={selectedCategory}
            disabled={isPending}
          />
          <Select
            className="w-full h-full "
            onValueChange={setSelectedCategory}
            disabled={isPending}
            defaultValue={isEdit ? `${data.category_id}` : undefined}
          >
            <SelectTrigger className="h-9.5 px-3 text-sm w-full rounded-sm border border-stone-300 focus:ring-2 focus:ring-stone-300 focus:border-transparent">
              <SelectValue placeholder={"Select category"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={`${category.id}`}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-stone-500">Content</span>
        <textarea
          name="content"
          placeholder="Write your announcement here..."
          className="px-2 py-1 border border-stone-300 rounded-sm min-h-40 overflow-y-auto resize-none text-sm"
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
              className={`bg-primary-500 hover:bg-primary-400 w-fit ${isPending ? "pointer-events-none opacity-50" : ""} `}
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
              className={"bg-primary-500 hover:bg-primary-400 w-fit "}
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
