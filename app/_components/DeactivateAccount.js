"use client";

import { useState, useTransition } from "react";
import { toastAndAction } from "../_services/helpers";
import { deactivateAccount } from "../_services/admin-actions";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ShieldBan, ShieldMinus } from "lucide-react";
import { is } from "date-fns/locale";
import CustomToolTip from "./CustomToolTip";

function DeactivateAccount({ id }) {
  const [isPending, startTransition] = useTransition();
  const [isHover, setIsHover] = useState(false);

  function handleAction(formData) {
    startTransition(
      async () =>
        await toastAndAction({
          loadingLabel: "Deleting account...",
          successLabel: "Account deleted.",
          errorLabel: "Failed to delete account.",
          action: deactivateAccount,
          formData,
        }),
    );
  }

  return (
    <form action={handleAction}>
      <input
        type="hidden"
        name="accountId"
        defaultValue={id}
        className="pointer-events-none cursor-not-allowed"
        disabled={isPending}
      />
      {/* <DialogFooter>
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
                "Deactivate"
              )}
            </Button>
          </DialogClose>
        </div>
      </DialogFooter> */}

      <button
        className="relative cursor-pointer flex flex-col justify-center items-center gap-1 p-1 rounded-sm transition-colors hover:bg-red-200 hover:text-red-600"
        disabled={isPending}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        {isPending ? (
          <Spinner className={"stroke-2 stroke-stone-400"} />
        ) : (
          <ShieldBan className="h-5 w-5" />
        )}

        {isHover && <CustomToolTip label={"Deactivate"} />}
      </button>
    </form>
  );
}

export default DeactivateAccount;
