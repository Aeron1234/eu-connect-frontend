"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { getInternshipRotations } from "../server-actions/rotations-actions";

export const rotationKeys = { record: (viewerId, internshipId) => ["internship-rotations", String(viewerId), String(internshipId)] };

// Keep each viewer/record private; callers must still expose failed reads and retry controls.
export default function useInternshipRotations(internshipId) {
  const { user } = useUser();
  return useQuery({
    queryKey: rotationKeys.record(user?.id, internshipId), enabled: Boolean(user?.id && internshipId),
    queryFn: async () => {
      const result = await getInternshipRotations(internshipId);
      if (!result?.success || !Array.isArray(result.rotations)) throw new Error(result?.error || "Could not load company rotations.");
      return result;
    }, staleTime: 15000, retry: false, refetchOnWindowFocus: true,
  });
}

