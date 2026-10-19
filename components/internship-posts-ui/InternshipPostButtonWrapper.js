"use client";

import { Plus } from "lucide-react";
import Modal from "../ui/Modal";
import InternshipPostButton from "./InternshipPostButton";
import { useUser } from "@/contexts/UserContext";
import { useQuery } from "@tanstack/react-query";
import { coursesOptions } from "@/lib/cache/reference-queries";
import TitleButton from "../ui/TitleButton";
import ModalFormSkeleton from "@/components/skeletons/ModalFormSkeleton";
import ErrorUI from "@/components/ui/ErrorUI";

function InternshipPostButtonWrapper() {
  const { user } = useUser();
  const userRole = user.role;
  const coursesQuery = useQuery({
    ...coursesOptions(user.id),
    enabled: Boolean(user.id) && userRole === "employer",
  });

  if (userRole !== "employer") return null;

  return (
    <Modal variant="form"
      trigger={
        <TitleButton>
          <Plus className="w-4 h-4" /> Post Job
        </TitleButton>
      }
      title={<span className={`text-primary-emphasis`}>Post Internship</span>}
    >
      {coursesQuery.isPending ? (
        <ModalFormSkeleton />
      ) : coursesQuery.isError ? (
        <div className="overflow-y-auto p-4 sm:p-6">
          <ErrorUI error={coursesQuery.error} reset={() => void coursesQuery.refetch()} compact logError={false} />
        </div>
      ) : <InternshipPostButton courses={coursesQuery.data} />}
    </Modal>
  );
}

export default InternshipPostButtonWrapper;
