"use client";

import { useRef, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { toastAndAction } from "@/lib/helpers";
import { respondToSupervisorRequest } from "@/lib/server-actions/supervisor-actions";
import { refreshSupervisionAfterResponse } from "@/lib/cache/supervision-mutations";
import { notifyNotificationsChanged } from "@/lib/notification-events";

export default function useSupervisorRequestResponse({ requestId, studentId, onSuccess }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [response, setResponse] = useState(null);
  const busy = useRef(false);

  function handleRespond(decision) {
    if (!requestId || busy.current || response || !["accept", "reject"].includes(decision)) return;
    // Block duplicate submissions before the transition's pending state renders.
    busy.current = true;
    const formData = new FormData();
    formData.set("requestId", requestId);
    formData.set("decision", decision);
    startTransition(async () => {
      try {
        const result = await toastAndAction({
          loadingLabel: decision === "accept" ? "Accepting request..." : "Declining request...",
          successLabel: decision === "accept" ? "Request accepted." : "Request declined.",
          errorLabel: "Failed to respond to request.",
          action: respondToSupervisorRequest,
          args: [formData],
        });
        // Keep failed responses retryable. Only confirmed success hides the controls
        // and refreshes local caches, independently of socket delivery.
        if (!result?.success) return;
        setResponse(decision);
        onSuccess?.();
        notifyNotificationsChanged();
        await refreshSupervisionAfterResponse(queryClient, user.id, { requestId, studentId, decision });
      } finally {
        busy.current = false;
      }
    });
  }

  return { isPending, response, handleRespond };
}
