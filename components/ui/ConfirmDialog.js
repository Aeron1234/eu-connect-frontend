"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ModalForm from "@/components/ui/ModalForm";
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
}) {
  const confirmationTitle = confirmLabel.startsWith("Delete")
    ? "Confirm Deletion"
    : confirmLabel.startsWith("Remove")
      ? "Confirm Removal"
      : confirmLabel.startsWith("Deactivate")
        ? "Confirm Deactivation"
        : confirmLabel.startsWith("Reject")
          ? "Confirm Rejection"
        : "Confirm Action";

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!pending) onOpenChange(next); }}>
      <DialogContent
        className="flex max-h-[calc(100dvh-1rem)] max-w-xl flex-col gap-3 overflow-auto p-3.5 sm:gap-4 sm:p-6"
        showCloseButton={!pending}
        aria-describedby={undefined}
      >
        <DialogHeader className="text-left">
          <DialogTitle className="pr-6 text-left text-sm text-primary-emphasis sm:text-base">{title}</DialogTitle>
        </DialogHeader>
        <ModalForm.Confirmation title={confirmationTitle}>{description}</ModalForm.Confirmation>
        <DialogFooter className="mt-1 border-t border-border pt-3 sm:pt-5">
          <div className="flex w-full flex-col-reverse gap-2 font-medium sm:flex-row sm:justify-end sm:gap-2.5">
            <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)} className="min-h-11 w-full rounded-xl px-5 sm:w-auto">Cancel</Button>
            <Button type="button" disabled={pending} onClick={onConfirm} className="min-h-11 w-full rounded-xl bg-primary px-6 font-semibold text-white shadow-sm hover:bg-primary-600 sm:w-auto">
              {pending ? <Spinner className="size-6 stroke-3 stroke-primary-50" /> : confirmLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
