"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function NotificationResponseActions({ handleRespond, isPending }) {
  const [decision, setDecision] = useState(null);

  function confirmResponse() {
    if (!decision || isPending) return;
    const response = decision;
    setDecision(null);
    handleRespond(response);
  }

  return (
    <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
      <ConfirmDialog
        open={Boolean(decision)}
        onOpenChange={(open) => { if (!open) setDecision(null); }}
        title={decision === "accept" ? "Accept supervisor request?" : "Decline supervisor request?"}
        description={decision === "accept"
          ? "You will become this student's supervisor for their ongoing internship."
          : "This supervisor request will be declined. The student will be notified of your decision."}
        confirmLabel={decision === "accept" ? "Accept request" : "Decline request"}
        intent={decision === "accept" ? "approve" : "decline"}
        pending={isPending}
        onConfirm={confirmResponse}
      />
      <button
        type="button"
        onClick={() => setDecision("accept")}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        <Check className="size-3.5" /> Accept
      </button>
      <button
        type="button"
        onClick={() => setDecision("reject")}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary disabled:opacity-50"
      >
        <X className="size-3.5" /> Decline
      </button>
    </div>
  );
}
