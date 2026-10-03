"use client";

import { useTransition } from "react";

import DeleteForm from "../ui/DeleteForm";
import { toastAndAction } from "../../lib/helpers";
import { deleteDtr } from "@/lib/server-actions/dtr-actions";

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
