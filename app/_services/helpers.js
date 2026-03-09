"use client";

import { toast } from "sonner";

export async function toastAndAction({
  loadingLabel,
  successLabel,
  errorLabel,
  action,
  formData,
  id = null,
}) {
  // 1. Call the action and get the result immediately
  const toastId = toast.loading(loadingLabel);

  // 2. Execute the action manually
  let result;

  if (!id) result = await action(null, formData);
  else result = await action(id, formData);

  // 3. Handle the result
  if (result?.success) {
    toast.success(result.message || successLabel, {
      duration: 3000,
      id: toastId,
    });
  } else {
    toast.error(result?.error || errorLabel, { duration: 3000, id: toastId });
  }
}

export function calculateShiftHours(clockInStr, clockOutStr) {
  const today = new Date();
  const start = parse(clockInStr, "HH:mm:ss", today);
  const end = parse(clockOutStr, "HH:mm:ss", today);
  return Number((differenceInMinutes(end, start) / 60).toFixed(2));
}
