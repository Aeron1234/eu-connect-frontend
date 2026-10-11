"use client";

import { Plus } from "lucide-react";
import Modal from "../ui/Modal";
import InternshipPostButton from "./InternshipPostButton";
import { useUser } from "@/contexts/UserContext";
import { useQuery } from "@tanstack/react-query";
import { coursesOptions } from "@/lib/cache/reference-queries";
import TitleButton from "../ui/TitleButton";
import ModalFormSkeleton from "@/components/skeletons/ModalFormSkeleton";

function InternshipPostButtonWrapper() {
  const { user } = useUser();
  const userRole = user.role;
  const coursesQuery = useQuery({
    ...coursesOptions(user.id),
    enabled: Boolean(user.id) && userRole === "employer",
  });

  if (userRole !== "employer") return null;

  return (
    <Modal
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
        <div role="alert" className="text-sm">
          <p>{coursesQuery.error.message}</p>
          <button type="button" className="mt-2 font-semibold text-primary-emphasis" onClick={() => void coursesQuery.refetch()}>Try again</button>
        </div>
      ) : <InternshipPostButton courses={coursesQuery.data} />}
    </Modal>
  );
}

export default InternshipPostButtonWrapper;
