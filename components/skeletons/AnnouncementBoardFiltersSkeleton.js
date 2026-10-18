"use client";

import { useUser } from "@/contexts/UserContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnnouncementBoardFiltersSkeleton() {
  const { user } = useUser();
  const showCategory = ["student", "department_head", "admin"].includes(user?.role) &&
    !(user?.role === "department_head" && user?.department_code === "REG");

  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-start">
      <div className="flex-1 sm:flex-none">
        <Skeleton className="h-10 w-full rounded-md sm:w-64" />
      </div>
      {showCategory && <Skeleton className="h-10 w-full rounded-md sm:w-[200px]" />}
    </div>
  );
}
