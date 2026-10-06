"use client";

import { Plus } from "lucide-react";
import Modal from "../ui/Modal";
import InternshipPostButton from "./InternshipPostButton";
import { useUser } from "@/contexts/UserContext";
import TitleButton from "../ui/TitleButton";

function InternshipPostButtonWrapper({ courses }) {
  const { user } = useUser();
  const userRole = user.role;

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
      <InternshipPostButton courses={courses || []} />
    </Modal>
  );
}

export default InternshipPostButtonWrapper;
