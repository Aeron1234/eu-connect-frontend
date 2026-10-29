"use client";

import { useTransition } from "react";
import { Mail } from "lucide-react";
import { toastAndAction } from "@/lib/helpers";
import { resendAccountInvitation } from "@/lib/server-actions/account-actions";

export default function ResendAccountInvitation({ accountId, onSuccess }) {
  const [pending, startTransition] = useTransition();
  return <button type="button" disabled={pending} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary-emphasis hover:bg-muted disabled:opacity-50 sm:w-auto"
    onClick={() => startTransition(async () => {
      const result = await toastAndAction({ loadingLabel: "Sending invitation...", successLabel: "Invitation sent.", errorLabel: "Could not send the invitation.", action: resendAccountInvitation, args: [accountId] });
      if (result?.success || result?.prepared) onSuccess?.(result);
    })}>
    <Mail className="size-4" aria-hidden="true" />{pending ? "Sending..." : "Resend invitation"}
  </button>;
}
