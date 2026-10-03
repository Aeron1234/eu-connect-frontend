"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toastAndAction } from "../helpers";
import {
  cancelSupervisorRequest,
  getSupervisorStatus,
  requestSupervisor,
} from "@/lib/server-actions/supervisor-actions";

export default function useSupervisorRequestStatus(employerId) {
  const [snapshot, setSnapshot] = useState(() => ({
    employerId,
    status: null,
    loaded: false,
  }));
  const [isPending, startTransition] = useTransition();
  const requestIdRef = useRef(0);

  const refreshStatus = useCallback(
    async (preserveOnError = false) => {
      const requestId = ++requestIdRef.current;
      let status;
      try {
        status = await getSupervisorStatus(employerId);
      } catch {
        status = { error: "Failed to get supervisor status." };
      }

      if (requestId !== requestIdRef.current) return;
      setSnapshot((current) => {
        if (
          preserveOnError &&
          (!status || status.error) &&
          current.employerId === employerId &&
          current.loaded
        ) {
          return current;
        }
        return { employerId, status, loaded: true };
      });
    },
    [employerId],
  );

  useEffect(() => {
    let active = true;
    const requestId = ++requestIdRef.current;
    getSupervisorStatus(employerId).then(
      (status) => {
        if (active && requestId === requestIdRef.current) {
          setSnapshot({ employerId, status, loaded: true });
        }
      },
      () => {
        if (active && requestId === requestIdRef.current) {
          setSnapshot({
            employerId,
            status: { error: "Failed to get supervisor status." },
            loaded: true,
          });
        }
      },
    );
    return () => {
      active = false;
      requestIdRef.current += 1;
    };
  }, [employerId]);

  const isLoadingStatus =
    snapshot.employerId !== employerId || !snapshot.loaded;
  const supervisorStatus =
    snapshot.employerId === employerId ? snapshot.status : null;

  function reconcileAfterSuccess(status) {
    requestIdRef.current += 1;
    setSnapshot((current) =>
      current.employerId === employerId
        ? { employerId, status, loaded: true }
        : current,
    );
    void refreshStatus(true);
  }

  function sendRequest() {
    const formData = new FormData();
    formData.append("employerId", employerId);

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Sending request...",
        successLabel: "Supervisor request sent.",
        errorLabel: "Failed to send request.",
        action: requestSupervisor,
        formData,
      });

      if (result?.success) {
        reconcileAfterSuccess({
          status: "pending",
          hasOngoingInternship: true,
          requestId: result.id,
        });
      }
    });
  }

  function cancelRequest() {
    if (!supervisorStatus?.requestId) return;

    const formData = new FormData();
    formData.append("requestId", supervisorStatus.requestId);
    formData.append("employerId", employerId);

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Cancelling request...",
        successLabel: "Request cancelled.",
        errorLabel: "Failed to cancel request.",
        action: cancelSupervisorRequest,
        formData,
      });

      if (result?.success) {
        reconcileAfterSuccess({ status: null, hasOngoingInternship: true });
      }
    });
  }

  return {
    supervisorStatus,
    isLoadingStatus,
    isPending,
    sendRequest,
    cancelRequest,
  };
}
