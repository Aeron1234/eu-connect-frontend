"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { clockIn, clockOut } from "../_services/actions";
import { useActionState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toastAndAction } from "../_services/helpers";

function DtrForm({ status }) {
  const action = status === "clocked-out" ? clockIn : clockOut;

  const [state, formAction, isPending] = useActionState(action, null);

  async function handleAction(formData) {
    const handlers = {
      loadingLabel: "Creating record...",
      successLabel: "Clock-in success",
      errorLabel: "Failed to clock-in",
      action,
      formData,
    };

    await toastAndAction(handlers);
  }

  return (
    <form action={handleAction} className="flex flex-col gap-6 w-full">
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

export default DtrForm;
