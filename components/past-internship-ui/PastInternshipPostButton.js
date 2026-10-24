"use client";

import { Plus } from "lucide-react";
import Modal from "../ui/Modal";
import HelpManual from "@/components/help-ui/HelpManual";
import { useUser } from "@/contexts/UserContext";
import PastInternshipPostEditForm from "./PastInternshipPostEditForm";
import { useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { coursesOptions } from "@/lib/cache/reference-queries";
import { postAlumniRecord } from "@/lib/server-actions/past-internships-actions";
import { pastInternshipsKeys } from "@/lib/cache/past-internships-queries";
import { toastAndAction } from "../../lib/helpers";
import TitleButton from "../ui/TitleButton";
import ModalFormSkeleton from "@/components/skeletons/ModalFormSkeleton";
import ErrorUI from "@/components/ui/ErrorUI";

export function PastInternshipsManual() {
  return <HelpManual guideId="past-internships" title="How to use past internships" />;
}

function PastInternshipPostButton() {
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const userRole = user.role;
  const userDepartment = user.department_code;
  const coursesQuery = useQuery({
    ...coursesOptions(user.id),
    enabled: Boolean(user.id) && userRole === "department_head" && userDepartment !== "REG",
  });
  const courses = coursesQuery.data || [];

  if (userRole !== "department_head" || userDepartment === "REG") return null;

  function handleAction(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Posting a record...",
        successLabel: "Record posted.",
        errorLabel: "Failed to post record.",
        action: postAlumniRecord,
        args: [formData],
      });
      if (result?.success) {
        queryClient.setQueriesData({ queryKey: pastInternshipsKeys.all(user.id) }, (old) =>
          old?.pages?.length ? { pages: [old.pages[0]], pageParams: [1] } : old,
        );
        void queryClient.invalidateQueries({ queryKey: pastInternshipsKeys.all(user.id) });
      }
    });
  }

  return (
    <Modal variant="form"
      trigger={
        <TitleButton>
          <Plus className="w-4 h-4" /> Post Record
        </TitleButton>
      }
      title={
        <span className={`text-primary-emphasis`}>
          Post alumni internship records
        </span>
      }
    >
      {coursesQuery.isPending ? (
        <ModalFormSkeleton />
      ) : coursesQuery.isError ? (
        <div className="overflow-y-auto p-4 sm:p-6">
          <ErrorUI error={coursesQuery.error} reset={() => void coursesQuery.refetch()} compact logError={false} />
        </div>
      ) : <PastInternshipPostEditForm
        courses={courses}
        handleAction={handleAction}
        isPending={isPending}
      />}
    </Modal>
  );
}

export default PastInternshipPostButton;
