"use client";

import { useTransition } from "react";
import { toastAndAction } from "../../lib/helpers";
import DeleteForm from "../ui/DeleteForm";
import { deleteFile } from "@/lib/server-actions/internship-docs-actions";

function StorageDeleteFile({ fileId = "", fileUrl = "", onDeleted }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    formData.append("fileUrl", fileUrl);

    const handlers = {
      loadingLabel: "Deleting file...",
      successLabel: "File deleted.",
      errorLabel: "Failed to delete.",
      action: deleteFile,
      formData,
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (result?.success) onDeleted?.();
    });
  }

  return (
    <DeleteForm
      handleAction={handleAction}
      id={fileId}
      isPending={isPending}
      name={"fileId"}
    />
  );
}

export default StorageDeleteFile;
