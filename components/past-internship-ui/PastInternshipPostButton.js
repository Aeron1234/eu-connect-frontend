"use client";

import { Plus } from "lucide-react";
import Modal from "../ui/Modal";
import ManualDialog from "../ui/ManualDialog";
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
  const { user } = useUser();
  if (user?.role !== "department_head" || user?.department_code === "REG") return null;

  return (
    <ManualDialog title="How to post a past internship">
      <div className="space-y-4 text-sm leading-relaxed text-foreground">
        <p>Add alumni internship records for your department so their placements appear in the Past Internships list.</p>
        <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
          <li>Select <strong>Post Record</strong> to open the form.</li>
          <li>Enter the alumnus&apos;s name, company, industry, course, company address, batch year, and academic year. Add the position, hours, supervisor name, or notes if you have them.</li>
          <li>Review the details, then select <strong>Post Record</strong> in the form to save it.</li>
          <li>Use the search box or academic-year filter to find the company. Open its card to see the alumni records.</li>
          <li>For records in your department, use the <strong>pencil</strong> to correct details or the <strong>trash</strong> icon to delete an entry. Confirm the deletion when prompted.</li>
        </ol>
      </div>
    </ManualDialog>
  );
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
