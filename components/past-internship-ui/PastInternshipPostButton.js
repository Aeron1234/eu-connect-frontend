"use client";

import { Plus } from "lucide-react";
import Modal from "../ui/Modal";
import { useUser } from "@/contexts/UserContext";
import PastInternshipPostEditForm from "./PastInternshipPostEditForm";
import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { postAlumniRecord } from "@/lib/server-actions/past-internships-actions";
import { pastInternshipsKeys } from "@/lib/cache/past-internships-queries";
import { toastAndAction } from "../../lib/helpers";
import TitleButton from "../ui/TitleButton";

function PastInternshipPostButton({ courses = [] }) {
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const userRole = user.role;
  const userDepartment = user.department_code;

  if (userRole !== "department_head" || userDepartment === "REG") return null;

  function handleAction(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Posting a record...",
        successLabel: "Record posted.",
        errorLabel: "Failed to post record.",
        action: postAlumniRecord,
        formData,
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
    <Modal
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
      <PastInternshipPostEditForm
        courses={courses}
        handleAction={handleAction}
        isPending={isPending}
      />
    </Modal>
  );
}

export default PastInternshipPostButton;
