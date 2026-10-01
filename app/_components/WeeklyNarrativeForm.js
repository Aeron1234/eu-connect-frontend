"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

const inputClass =
  "mt-1 px-3 py-2 border border-border bg-card rounded-md text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

function WeeklyNarrativeForm({
  handleAction,
  isPending,
  data = null,
  type = "",
}) {
  return (
    <form action={handleAction} className="flex-1 flex flex-col gap-4">
      {type === "edit" && (
        <input type="hidden" name="narrativeId" defaultValue={data?.id} />
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <label className="flex flex-col flex-1">
          <span className="text-sm font-semibold text-foreground-soft">
            Week number
          </span>
          <input
            type="number"
            name="week_number"
            placeholder="0"
            className={inputClass}
            defaultValue={type === "edit" ? data.week_number : ""}
            disabled={isPending}
            min={1}
            max={52}
            required
          />
        </label>

        <label className="flex flex-col flex-1">
          <span className="text-sm font-semibold text-foreground-soft">Title</span>
          <input
            type="text"
            name="title"
            placeholder="Subject of the week..."
            className={inputClass}
            defaultValue={type === "edit" ? data.title : ""}
            disabled={isPending}
            maxLength={50}
            required
          />
        </label>
      </div>

      <label className="flex flex-col">
        <span className="text-sm font-semibold text-foreground-soft">Narrative</span>
        <textarea
          name="narrative"
          placeholder="How was your week?"
          className={`${inputClass} min-h-40 sm:min-h-50 resize-none`}
          defaultValue={type === "edit" ? data.narrative : ""}
          disabled={isPending}
          maxLength={2000}
          required
        />
      </label>

      <DialogFooter>
        <div className="flex gap-2 font-semibold w-full justify-end">
          <DialogClose asChild>
            <Button variant="outline" className="w-fit" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              className={`bg-primary hover:bg-primary-600 w-fit ${isPending ? "pointer-events-none opacity-50" : ""}`}
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <Spinner className="size-6 stroke-3 stroke-primary-50" />
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

export default WeeklyNarrativeForm;
