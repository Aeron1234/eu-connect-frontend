"use client";

import { useState, useTransition } from "react";
import { toastAndAction } from "../../lib/helpers";
import { deactivateAccount } from "@/lib/server-actions/account-actions";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Spinner } from "@/components/ui/spinner";
import { ShieldBan } from "lucide-react";

function DeactivateAccount({ id, accountName, onSuccess }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAction() {
    const formData = new FormData();
    formData.set("accountId", id);

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Deactivating account...",
        successLabel: "Account deactivated.",
        errorLabel: "Failed to deactivate account.",
        action: deactivateAccount,
        args: [formData],
      });

      if (result?.success) {
        setConfirming(false);
        onSuccess?.();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        className="relative cursor-pointer flex flex-col justify-center items-center gap-1 p-1 rounded-sm transition-colors hover:bg-red-200 hover:text-red-600"
        disabled={isPending}
        title="Deactivate account"
        aria-label={`Deactivate ${accountName}`}
        onClick={() => setConfirming(true)}
      >
        {isPending ? (
          <Spinner className={"stroke-2 stroke-stone-400"} />
        ) : (
          <ShieldBan className="h-5 w-5" />
        )}
      </button>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Deactivate account?"
        description={`Deactivate ${accountName}? This account will no longer be able to sign in until it is reactivated.`}
        confirmLabel="Deactivate"
        pending={isPending}
        onConfirm={handleAction}
      />
    </>
  );
}

export default DeactivateAccount;
