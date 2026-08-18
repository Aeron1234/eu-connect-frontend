"use client";

import { Plus } from "lucide-react";
import Modal from "./Modal";
import InternshipPostButton from "./InternshipPostButton";
import { useUser } from "@/contexts/UserContext";

function InternshipPostButtonWrapper({ courses }) {
  const { user } = useUser();
  const userRole = user.role;

  if (userRole !== "employer") return null;

  return (
    <Modal
      trigger={
        <div className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition cursor-pointer shrink-0">
          <Plus className="w-4 h-4" />
          <span className="text-white text-sm font-semibold">Post Job</span>
        </div>
      }
      title={<span className={`text-primary-500`}>Post Internship</span>}
      description={`Do you need an intern? Post the job here.`}
    >
      <InternshipPostButton courses={courses || []} />
    </Modal>
  );
}

export default InternshipPostButtonWrapper;
