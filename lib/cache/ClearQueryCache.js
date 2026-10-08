"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function ClearQueryCache({ children }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.clear();
  }, [queryClient]);

  return children;
}
