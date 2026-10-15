"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toastAndAction } from "../helpers";
import {
  cancelSupervisorRequest,
  getSupervisorStatus,
  removeSupervisor,
  requestSupervisor,
} from "@/lib/server-actions/supervisor-actions";
import { socket } from "@/components/ui/SocketProvider";

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

  useEffect(() => {
    const refresh = () => void refreshStatus(true);
    const refreshForNotification = (notification) => {
      if (notification?.type === "supervisor_request_accepted") refresh();
    };
    window.addEventListener("supervisor-status-changed", refresh);
    socket.on("supervisor_status_changed", refresh);
    socket.on("new_notification", refreshForNotification);
    return () => {
      window.removeEventListener("supervisor-status-changed", refresh);
      socket.off("supervisor_status_changed", refresh);
      socket.off("new_notification", refreshForNotification);
    };
  }, [refreshStatus]);

  const isLoadingStatus =
    snapshot.employerId !== employerId || !snapshot.loaded;
  const supervisorStatus =
    snapshot.employerId === employerId ? snapshot.status : null;

  function reconcileAfterSuccess(status, refreshOtherEmployers = false) {
    requestIdRef.current += 1;
    setSnapshot((current) =>
      current.employerId === employerId
        ? { employerId, status, loaded: true }
        : current,
    );
    if (refreshOtherEmployers) {
      window.dispatchEvent(new Event("supervisor-status-changed"));
    } else {
      void refreshStatus(true);
    }
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
        args: [formData],
      });

      if (result?.success) {
        reconcileAfterSuccess({
          status: "pending",
          hasOngoingInternship: true,
          hasSupervisor: false,
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
        args: [formData],
      });

      if (result?.success) {
        reconcileAfterSuccess({ status: null, hasOngoingInternship: true, hasSupervisor: false });
      }
    });
  }

  function unsetSupervisor() {
    const formData = new FormData();
    formData.append("employerId", employerId);

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Removing supervisor...",
        successLabel: "Supervisor removed.",
        errorLabel: "Failed to remove supervisor.",
        action: removeSupervisor,
        args: [formData],
      });
      if (result?.success) {
        reconcileAfterSuccess({ status: null, hasOngoingInternship: true, hasSupervisor: false }, true);
      }
    });
  }

  return {
    supervisorStatus,
    isLoadingStatus,
    isPending,
    sendRequest,
    cancelRequest,
    unsetSupervisor,
  };
}
