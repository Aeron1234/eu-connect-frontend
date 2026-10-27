"use client";

import { useId, useRef, useState } from "react";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import ConfirmationContent, {
  confirmationActionGroupClass,
  confirmationCancelClass,
  confirmationPrimaryClass,
} from "./ConfirmationContent";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  pending = false,
  reasonRequired = false,
  intent = "warning",
}) {
  const [reason, setReason] = useState("");
  const reasonId = useId();
  const reasonInput = useRef(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setReason("");
  }
  function confirm() {
    if (!reasonRequired) return onConfirm();
    const input = reasonInput.current;
    input.setCustomValidity(reason.trim() ? "" : "Enter a rejection reason.");
    if (input.reportValidity()) onConfirm(reason.trim());
  }
  const [lastOpenContent, setLastOpenContent] = useState({ title, description, confirmLabel, intent });

  // Radix keeps the content mounted during its exit animation. Callers may
  // clear their selected action immediately, but its presentation must stay.
  if (open && (
    lastOpenContent.title !== title ||
    lastOpenContent.description !== description ||
    lastOpenContent.confirmLabel !== confirmLabel ||
    lastOpenContent.intent !== intent
  )) {
    setLastOpenContent({ title, description, confirmLabel, intent });
  }
  const content = open ? { title, description, confirmLabel, intent } : lastOpenContent;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => { if (!pending) onOpenChange(next); }}
    >
      <ConfirmationContent
        title={content.title}
        description={content.description}
        showCloseButton={!pending}
        intent={content.intent}
      >
        {reasonRequired && <div className="space-y-2">
          <label htmlFor={reasonId} className="text-sm font-medium">Reason for rejection</label>
          <textarea id={reasonId} ref={reasonInput} required maxLength={1000}
            value={reason} disabled={pending} rows={4}
            onChange={(event) => { event.target.setCustomValidity(""); setReason(event.target.value); }}
            placeholder="Explain what the student needs to correct..."
            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <p className="text-xs text-muted-foreground">The student will see this reason on their record and notification.</p>
        </div>}
        <DialogFooter className="w-full">
          <div className={confirmationActionGroupClass}>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
              className={confirmationCancelClass}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={confirm}
              className={confirmationPrimaryClass}
            >
              {pending ? <Spinner className="size-4" /> : content.confirmLabel}
            </Button>
          </div>
        </DialogFooter>
      </ConfirmationContent>
    </Dialog>
  );
}
