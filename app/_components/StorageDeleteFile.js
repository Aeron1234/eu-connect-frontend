"use client";

import { useTransition } from "react";
import { toastAndAction } from "../_services/helpers";
import DeleteForm from "./DeleteForm";
import { deleteFile } from "../_services/student-actions";

function StorageDeleteFile({ fileId, fileUrl }) {
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

    startTransition(async () => await toastAndAction(handlers));
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
