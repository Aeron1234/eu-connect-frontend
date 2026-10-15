"use client";

import { useState } from "react";
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
  intent = "warning",
}) {
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
              onClick={onConfirm}
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
