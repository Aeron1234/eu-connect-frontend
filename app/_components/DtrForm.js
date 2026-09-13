"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { clockIn, clockOut } from "../_services/student-actions";
import { useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toastAndAction, useGetLocation } from "../_services/helpers";

function DtrForm({ isOut }) {
  const action = isOut ? clockIn : clockOut;

  const [isPending, startTransition] = useTransition();

  const coords = useGetLocation();

  const { latitude, longitude } = coords;

  function handleAction(formData) {
    // const tempLat = 13.9304557;
    // const tempLon = 121.4312752;

    formData.append(isOut ? "lat_in" : "lat_out", latitude);
    formData.append(isOut ? "lon_in" : "lon_out", longitude);

    const handler = {
      loadingLabel: isOut ? "Clocking in..." : "Clocking out...",
      successLabel: isOut ? "Clocked in!" : "Clocked out!",
      errorLabel: isOut ? "Failed to clock in." : "Failed to clock out.",
      action,
      formData,
    };

    startTransition(async () => await toastAndAction(handler));
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
