"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function DtrLocationConfirmation({
  confirmation,
  setConfirmation,
  isCustom,
  isPending,
  handleRemove,
  handleSetLocation,
}) {
  return (
    <ConfirmDialog
      open={Boolean(confirmation)}
      onOpenChange={open => {
        if (!open) setConfirmation(null);
      }}
      title={confirmation === "remove" ? "Remove DTR location?" : "Save DTR location?"}
      description={confirmation === "remove" ? isCustom ? "The custom location will be removed. Attendance will use the company's default location again." : "The unsaved pin will be cleared from this form." : "The student's clock-in and clock-out location will use this pin and radius."}
      confirmLabel={confirmation === "remove" ? "Remove location" : "Save location"}
      destructive={confirmation === "remove"}
      pending={isPending}
      onConfirm={() => {
        const action = confirmation;
        setConfirmation(null);
        if (action === "remove") handleRemove();else if (action === "save") handleSetLocation();
      }}
    />
  );
}
