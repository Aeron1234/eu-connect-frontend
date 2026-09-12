"use client";

import { useState, useTransition } from "react";
import { toastAndAction } from "../_services/helpers";
import { reactivateAccount } from "../_services/admin-actions";
import { ShieldCheck } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import CustomToolTip from "./CustomToolTip";

function ReactivateAccount({ id, onSuccess }) {
  const [isHover, setIsHover] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Reactivating account...",
        successLabel: "Account reactivated.",
        errorLabel: "Failed to reactivate account.",
        action: reactivateAccount,
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
        className="relative cursor-pointer flex flex-col justify-center items-center gap-1 p-1 rounded-sm transition-colors hover:bg-green-200 hover:text-green-600"
        disabled={isPending}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        {isPending ? (
          <Spinner className={"stroke-2 stroke-stone-400"} />
        ) : (
          <ShieldCheck className="h-5 w-5" />
        )}

        {isHover && <CustomToolTip label={"Activate"} />}
      </button>
    </form>
  );
}

export default ReactivateAccount;
