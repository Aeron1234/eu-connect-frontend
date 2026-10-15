"use client";

import { useTransition } from "react";
import { toastAndAction } from "../../lib/helpers";
import { reactivateAccount } from "@/lib/server-actions/account-actions";
import { ShieldCheck } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

function ReactivateAccount({ id, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Reactivating account...",
        successLabel: "Account reactivated.",
        errorLabel: "Failed to reactivate account.",
        action: reactivateAccount,
        args: [formData],
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
        title="Reactivate account"
      >
        {isPending ? (
          <Spinner className={"stroke-2 stroke-stone-400"} />
        ) : (
          <ShieldCheck className="h-5 w-5" />
        )}
      </button>
    </form>
  );
}

export default ReactivateAccount;
