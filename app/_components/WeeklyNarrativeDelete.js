"use client";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { deleteWeeklyNarrative } from "../_services/student-actions";
import { toastAndAction } from "../_services/helpers";

function WeeklyNarrativeDelete({ narrativeId, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Deleting narrative...",
        successLabel: "Narrative deleted.",
        errorLabel: "Failed to delete narrative.",
        action: deleteWeeklyNarrative,
        formData,
      });

      if (result?.success) onSuccess?.();
    });
  }

  return (
    <form action={handleAction}>
      <input type="hidden" name="narrativeId" defaultValue={narrativeId} />
      <DialogFooter>
        <div className="flex gap-2 font-semibold w-full justify-end">
          <DialogClose asChild>
            <Button variant="outline" className="w-fit" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 w-fit"
          >
            {isPending ? (
              <Spinner className="size-6 stroke-3 stroke-red-50" />
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}

export default WeeklyNarrativeDelete;
