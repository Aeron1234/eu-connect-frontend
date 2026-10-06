"use client";

import { useTransition } from "react";
import { toastAndAction } from "../../lib/helpers";
import { finishInternshipRecord } from "@/lib/server-actions/internship-records-actions";
import ModalForm from "@/components/ui/ModalForm";

function InternshipRecordFinishForm({ internshipId }) {
  const [isPending, startTransition] = useTransition();

  function handleAction() {
    if (!internshipId) return null;

    const formData = new FormData();
    formData.append("id", internshipId);

    const handlers = {
      loadingLabel: "Finishing internship record...",
      successLabel: "Congrats!",
      errorLabel: "Finishing internship record failed.",
      action: finishInternshipRecord,
      formData,
    };

    startTransition(async () => await toastAndAction(handlers));
  }

  return (
    <ModalForm.Root action={handleAction}>
      <ModalForm.Confirmation>
        This internship record will be marked as finished.
      </ModalForm.Confirmation>
      <ModalForm.Actions isPending={isPending} disableCancelWhilePending submitLabel="Finish" />
    </ModalForm.Root>
  );
}

export default InternshipRecordFinishForm;
