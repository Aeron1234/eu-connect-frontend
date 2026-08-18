"use client";

import { useTransition } from "react";
import { toastAndAction } from "../_services/helpers";
import { finishInternshipRecord } from "../_services/student-actions";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function InternshipRecordFinishForm({ internshipId }) {
  const [isPending, startTransition] = useTransition();

  function handleAction() {
    if (!internshipId) return null;

    const formData = new FormData();
    formData.append("id", internshipId);

    const handlers = {
      loadingLabel: "Finishing internship record...",
      successLabel: "Congrats!",
      errorLabel: "Finishing internship record failed.",
      action: finishInternshipRecord,
      formData,
    };

    startTransition(async () => await toastAndAction(handlers));
  }

  return (
    <form action={handleAction}>
      <DialogFooter>
        <div className="flex gap-2 font-semibold w-full justify-end">
          <DialogClose asChild>
            <Button variant="outline" className={"w-fit"} disabled={isPending}>
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
