"use client";

import { useTransition } from "react";

import DeleteForm from "./DeleteForm";

function DtrDeleteForm({ dtrId, onDelete }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    startTransition(async () => await onDelete?.(dtrId));
  }

  return (
    <DeleteForm
      handleAction={handleAction}
      id={dtrId}
      isPending={isPending}
      name={"dtrId"}
    />
  );
}

export default DtrDeleteForm;
