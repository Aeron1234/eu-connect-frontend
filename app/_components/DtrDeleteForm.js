"use client";

import { useTransition } from "react";

import DeleteForm from "./DeleteForm";
import { toastAndAction } from "../_services/helpers";
import { deleteDtr } from "../_services/student-actions";

function DtrDeleteForm({ dtrId }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    startTransition(
      async () =>
        await toastAndAction({
          loadingLabel: "Deleting record...",
          successLabel: "Record deleted.",
          errorLabel: "Failed to delete.",
          action: deleteDtr,
          formData,
        }),
    );
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
