"use client";

import { deleteDtr } from "../_services/student-actions";
import { useTransition } from "react";
import { toastAndAction } from "../_services/helpers";
import DeleteForm from "./DeleteForm";

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
