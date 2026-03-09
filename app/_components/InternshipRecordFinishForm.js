"use client";

import { useActionState } from "react";
import { toastAndAction } from "../_services/helpers";
import { finishInternshipRecord } from "../_services/actions";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function InternshipRecordFinishForm({ internshipId }) {
  const [state, formAction, isPending] = useActionState(
    finishInternshipRecord,
    null,
  );

  if (!internshipId) return null;

  async function handleAction(formData) {
    const handlers = {
      loadingLabel: "Updating internship record...",
      successLabel: "Congrats!",
      errorLabel: "Failed to update.",
      action: finishInternshipRecord,
      formData,
      id: internshipId,
    };

    await toastAndAction(handlers);
  }

  return (
    <form action={handleAction}>
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
              // onClick={() => toast.success("Event has been created")}
            >
              {isPending ? (
                <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
              ) : (
                "Finish"
              )}
            </Button>
          </DialogClose>
        </div>
      </DialogFooter>
    </form>
  );
}

export default InternshipRecordFinishForm;
