"use client";

import { useActiveInternship, useProfile } from "../_services/tanstack-queries";
import InternshipRecordButton from "./InternshipRecordButton";
import SpinnerBig from "./SpinnerBig";

function DashboardTitle() {
  const { data: internshipData, isPending: isLoadingInternship } =
    useActiveInternship();
  const { data: profileData, isPending: isLoadingProfile } = useProfile();

  if (isLoadingInternship || isLoadingProfile) return <SpinnerBig />;

  return (
    <header className="flex items-start justify-between gap-4 mt-4">
      <h1
        className={`flex items-center gap-2 text-xl self-start font-bold text-foreground max-md:text-lg max-xs:text-base`}
      >
        Welcome back, {profileData?.first_name}
      </h1>

      <InternshipRecordButton internshipData={internshipData} />
    </header>
  );
}

export default DashboardTitle;
