"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

function DailyNarrativeForm({
  handleAction,
  isPending,
  data = null,
  type = "",
}) {
  return (
    <form action={handleAction} className="flex-1 flex flex-col gap-4">
      <div className="flex gap-4 flex-1 max-sm:flex-col">
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-semibold text-muted-foreground">
            Day number
          </span>
          <input
            type="number"
            name="day_number"
            placeholder="0"
            className="px-2 py-1 border border-border rounded-md"
            defaultValue={type === "edit" ? data.day_number : ""}
            disabled={isPending}
            max={200}
            required
          />
        </label>

        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-semibold text-muted-foreground">Title</span>
          <input
            type="text"
            name="title"
            placeholder="Subject of the day..."
            className="px-2 py-1 border border-border rounded-md"
            defaultValue={type === "edit" ? data.title : ""}
            disabled={isPending}
            max={100}
            required
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-muted-foreground">Narrative</span>
        <textarea
          name="narrative"
          placeholder="How's your day?"
          className="px-2 py-1 border border-border rounded-md min-h-50 overflow-y-auto resize-none"
          defaultValue={type === "edit" ? data.narrative : ""}
          disabled={isPending}
          max={2000}
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

export default DailyNarrativeForm;
