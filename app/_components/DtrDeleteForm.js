"use client";

import { deleteDtr } from "../_services/actions";
import { useActionState } from "react";
import { toastAndAction } from "../_services/helpers";
import DeleteForm from "./DeleteForm";

function DtrDeleteForm({ dtrId }) {
  const [state, formAction, isPending] = useActionState(deleteDtr, null);

  async function handleAction(formData) {
    const handlers = {
      loadingLabel: "Deleting record...",
      successLabel: "Record deleted.",
      errorLabel: "Failed to delete.",
      action: deleteDtr,
      formData,
    };

    await toastAndAction(handlers);
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
