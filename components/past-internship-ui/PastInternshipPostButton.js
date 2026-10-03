"use client";

import { Plus } from "lucide-react";
import Modal from "../ui/Modal";
import { useUser } from "@/contexts/UserContext";
import PastInternshipPostEditForm from "./PastInternshipPostEditForm";
import { useTransition } from "react";
import { postAlumniRecord } from "@/lib/server-actions/past-internships-actions";
import { toastAndAction } from "../../lib/helpers";
import TitleButton from "../ui/TitleButton";

function PastInternshipPostButton({ courses = [] }) {
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();

  const userRole = user.role;
  const userDepartment = user.department_code;

  if (userRole !== "department_head" || userDepartment === "REG") return null;

  function handleAction(formData) {
    startTransition(() =>
      toastAndAction({
        loadingLabel: "Posting a record...",
        successLabel: "Record posted.",
        errorLabel: "Failed to post record.",
        action: postAlumniRecord,
        formData,
      }),
    );
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
      description={`Let students see the companies that accepted interns in the past.`}
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
