"use client";

import { Plus } from "lucide-react";
import Modal from "./Modal";
import { useUser } from "@/contexts/UserContext";
import PastInternshipPostEditForm from "./PastInternshipPostEditForm";
import { useTransition } from "react";
import { postAlumniRecord } from "../_services/dept-head-actions";
import { toastAndAction } from "../_services/helpers";

function PastInternshipPostButton({ courses = [] }) {
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();

  const userRole = user.role;
  const userDepartment = user.department_code;

  const isRegistrar =
    userRole === "department_head" && userDepartment === "REG";

  if (userRole !== "department_head" && isRegistrar) return null;

  function handleAction(formData) {
    const x = Object.fromEntries(formData);
    console.log(x);

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
        <div className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition cursor-pointer shrink-0">
          <Plus className="w-4 h-4" />
          <span className="text-white text-sm font-semibold">Post Record</span>
        </div>
      }
      title={
        <span className={`text-primary-500`}>
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
