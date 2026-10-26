"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { fileRequirementTypesOptions } from "@/lib/cache/reference-queries";
import {
  activeStorageRecordOptions,
  pastStorageRecordsOptions,
} from "@/lib/cache/student-storage-queries";

export default function useStudentStorage() {
  const { user } = useUser();
  const currentUserId = user?.id || "";
  const activeQuery = useQuery({
    ...activeStorageRecordOptions(currentUserId),
    enabled: Boolean(currentUserId),
  });
  const typesQuery = useQuery({
    ...fileRequirementTypesOptions(currentUserId),
    enabled: Boolean(currentUserId),
  });
  const pastQuery = useQuery({ ...pastStorageRecordsOptions(currentUserId), enabled: Boolean(currentUserId) });
  const ongoing = activeQuery.data;
  const fileRequirementTypes = typesQuery.data || [];
  // Separate failed initial reads from background refresh failures so loaded
  // documents remain visible instead of being replaced by an empty/error page.
  const currentError = (activeQuery.isError && activeQuery.data === undefined) ||
    (typesQuery.isError && typesQuery.data === undefined);
  const pastError = pastQuery.isError && pastQuery.data === undefined;
  const refreshError = (activeQuery.isError && activeQuery.data !== undefined) ||
    (typesQuery.isError && typesQuery.data !== undefined) ||
    (pastQuery.isError && pastQuery.data !== undefined);
  return {
    currentUserId,
    activeQuery,
    typesQuery,
    pastQuery,
    ongoing,
    fileRequirementTypes,
    currentError,
    pastError,
    refreshError,
  };
}
