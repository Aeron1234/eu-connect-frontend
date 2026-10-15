"use client";

import { useTransition } from "react";
import { toastAndAction } from "../../lib/helpers";
import { finishInternshipRecord } from "@/lib/server-actions/internship-records-actions";
import ModalForm from "@/components/ui/ModalForm";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { dashboardOverviewKeys } from "@/lib/cache/dashboard-overview-queries";
import { studentRecordsKeys } from "@/lib/cache/student-records-queries";
import { mapLocationsKeys } from "@/lib/cache/map-locations-queries";
import { studentStorageKeys } from "@/lib/cache/student-storage-queries";

function InternshipRecordFinishForm({ internshipId }) {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const { user } = useUser();

  function handleAction() {
    if (!internshipId) return null;

    const formData = new FormData();
    formData.append("id", internshipId);

    const handlers = {
      loadingLabel: "Finishing internship record...",
      successLabel: "Congrats!",
      errorLabel: "Finishing internship record failed.",
      action: finishInternshipRecord,
      args: [formData],
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (result?.success) {
        void queryClient.invalidateQueries({ queryKey: dashboardOverviewKeys.role(user?.id, "student") });
        void queryClient.invalidateQueries({ queryKey: studentRecordsKeys.records(user?.id) });
        void queryClient.invalidateQueries({ queryKey: mapLocationsKeys.all(user?.id) });
        void queryClient.invalidateQueries({ queryKey: studentStorageKeys.active(user?.id) });
        void queryClient.invalidateQueries({ queryKey: studentStorageKeys.pastRecords(user?.id) });
      }
    });
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
