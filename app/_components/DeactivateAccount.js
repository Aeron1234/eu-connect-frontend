"use client";

import { useState, useTransition } from "react";
import { toastAndAction } from "../_services/helpers";
import { deactivateAccount } from "../_services/admin-actions";
import { Spinner } from "@/components/ui/spinner";
import { ShieldBan } from "lucide-react";
import CustomToolTip from "./CustomToolTip";

function DeactivateAccount({ id, onSuccess }) {
  const [isPending, startTransition] = useTransition();
  const [isHover, setIsHover] = useState(false);

  function handleAction(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Deactivating account...",
        successLabel: "Account deactivated.",
        errorLabel: "Failed to deactivate account.",
        action: deactivateAccount,
        formData,
      });

      if (result?.success) {
        onSuccess?.();
      }
    });
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
