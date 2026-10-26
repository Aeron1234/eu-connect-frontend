"use client";

import ModalForm from "@/components/ui/ModalForm";
import { clockIn, clockOut } from "@/lib/server-actions/dtr-actions";
import { useState } from "react";
import { toastAndAction, useGetLocation } from "../../lib/helpers";
import { toast } from "sonner";

function DtrForm({ isOut, onSuccess }) {
  // isOut means currently CLOCKED_OUT, so this form will clock in.
  const action = isOut ? clockIn : clockOut;

  const [isPending, setIsPending] = useState(false);

  const { refreshLocation } = useGetLocation(false);

  async function handleAction(formData) {
    if (isPending) return;
    setIsPending(true);
    try {
      // Get the position at submission time. The modal may open before a
      // phone has its first GPS fix, and an earlier reading may be stale.
      const { latitude, longitude } = await refreshLocation();
      formData.set(isOut ? "lat_in" : "lat_out", String(latitude));
      formData.set(isOut ? "lon_in" : "lon_out", String(longitude));

      const result = await toastAndAction({
        loadingLabel: isOut ? "Clocking in..." : "Clocking out...",
        successLabel: isOut ? "Clocked in!" : "Clocked out!",
        errorLabel: isOut ? "Failed to clock in." : "Failed to clock out.",
        action,
        args: [formData],
      });
      if (result?.success) onSuccess?.();
    } catch (error) {
      toast.error(error.message || "Could not get your current location. Please try again.");
    // Keep submission disabled through GPS acquisition and the server action.
    // Always release pending state after failure so the student can retry.
    } finally {
      setIsPending(false);
    }
  }

  return (
    <ModalForm.Root action={handleAction} className="w-full">
      <ModalForm.Confirmation>
        {isOut ? "Record your clock-in now?" : "Record your clock-out now?"}
      </ModalForm.Confirmation>
      <ModalForm.Actions isPending={isPending} submitLabel="Save" closeOnSubmit={false} />
    </ModalForm.Root>
  );
}

export default DtrForm;
