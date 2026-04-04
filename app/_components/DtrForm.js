"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { clockIn, clockOut } from "../_services/student-actions";
import { useEffect, useState, useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toastAndAction, useApiFetch } from "../_services/helpers";

function DtrForm({ status }) {
  const action = status === "clocked-out" ? clockIn : clockOut;

  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setQuery(`/api/geocode?lat=${latitude}&lon=${longitude}`);
        },
        (error) => {
          console.log(error.message);
        },
      );
    }
  }, []);

  const { data: locationData } = useApiFetch(query);

  function handleAction(locationData) {
    const formData = new FormData();

    formData.append(
      status === "clocked-out" ? "location_in" : "location_out",
      locationData.display_name,
    );

    startTransition(() =>
      toastAndAction({
        loadingLabel:
          status === "clocked-out"
            ? "Creating record..."
            : "Updating record...",
        successLabel:
          status === "clocked-out" ? "Clock-in success" : "Clock-out success",
        errorLabel:
          status === "clocked-out"
            ? "Failed to clock-in"
            : "Failed to clock-out",
        action,
        formData,
      }),
    );
  }

  return (
    <form
      action={() => handleAction(locationData)}
      className="flex flex-col gap-6 w-full"
    >
      <DialogFooter>
        <div className="flex gap-2 font-semibold w-full justify-end">
          {!locationData ? (
            <Spinner className={"size-5 stroke-3 stroke-stone-400"} />
          ) : (
            <>
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
            </>
          )}
        </div>
      </DialogFooter>
    </form>
  );
}

export default DtrForm;
