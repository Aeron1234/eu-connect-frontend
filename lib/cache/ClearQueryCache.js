"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function ClearQueryCache({ children }) {
  const queryClient = useQueryClient();

  // The login layout mounts this boundary to clear the shared client cache.
  // This effect runs on mount/client change; it does not observe account changes itself.
  useEffect(() => {
    queryClient.clear();
  }, [queryClient]);

  return children;
}
