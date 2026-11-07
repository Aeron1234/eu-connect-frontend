"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { readRotations, retryRotationRead, rotationAccessLost } from "../rotation-read.mjs";

export const rotationKeys = { record: (viewerId, internshipId) => ["internship-rotations", String(viewerId), String(internshipId)] };

// Keep each viewer/record private; callers must still expose failed reads and retry controls.
export default function useInternshipRotations(internshipId, enabled = true) {
  const { user } = useUser();
  const query = useQuery({
    queryKey: rotationKeys.record(user?.id, internshipId), enabled: Boolean(enabled && user?.id && internshipId),
    queryFn: ({ signal }) => readRotations(internshipId, { signal }),
    staleTime: 30000, retry: retryRotationRead, retryDelay: 1000,
    refetchOnWindowFocus: true, refetchOnReconnect: true,
  });
  // Authorization loss must hide private cached data from every consumer.
  return rotationAccessLost(query.error) ? { ...query, data: undefined } : query;
}

