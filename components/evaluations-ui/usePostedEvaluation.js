"use client";

import { useState, useTransition } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  respondToStudentEvaluation,
  restoreDisputedEvaluation,
  reviewDisputedEvaluation,
} from "@/lib/server-actions/evaluations-actions";
import { toastAndAction } from "@/lib/helpers";

export default function usePostedEvaluation({
  ev,
  defaultOpen,
  type = "default",
  onOptimisticRemove,
  onOptimisticRestore,
  onChanged,
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [isPending, startTransition] = useTransition();

  const { user } = useUser();
  const userId = user.id || "";
  const userRole = user.role || "";

  const total = ev.breakdown.reduce((a, b) => a + b.score, 0);
  const totalMax = ev.breakdown.reduce((a, b) => a + b.max, 0);

  const isStaff = userRole === "department_head" || userRole === "admin";
  const canPrint =
    ev.type === "Performance Evaluation" &&
    (isStaff || (userRole === "employer" && userId === ev.evaluator_id));

  function handleResponse(res) {
    if (type !== "confirmation" || !["completed", "disputed"].includes(res))
      return;

    const formData = new FormData();
    formData.append("evaluationId", ev.id);
    formData.append("decision", res);

    const isAccepted = res === "completed";

    // Optimistically leaves the "Pending Confirmation" list the instant
    // the button is clicked — it now belongs in "Past Evaluations" or
    // "Disputed", not here.
    onOptimisticRemove?.();

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: `${isAccepted ? "Accepting" : "Disputing"} student evaluation...`,
        successLabel: `Student evaluation was ${isAccepted ? "Accepted!" : "Disputed!"}`,
        errorLabel: `${isAccepted ? "Accepting" : "Disputing"} student evaluation failed.`,
        action: respondToStudentEvaluation,
        args: [formData],
      });

      if (!result?.success) {
        onOptimisticRestore?.(ev);
      } else {
        onChanged?.();
      }
    });
  }

  function handleRestore() {
    if (type !== "disputed") return;

    const formData = new FormData();
    formData.append("evaluationId", ev.id);

    // Optimistically leaves the "Disputed" list the instant Restore is
    // clicked — it now belongs back in "Pending Confirmation".
    onOptimisticRemove?.();

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: `Restoring student evaluation...`,
        successLabel: `Student evaluation was restored!`,
        errorLabel: `Restoring student evaluation failed.`,
        action: restoreDisputedEvaluation,
        args: [formData],
      });

      if (!result?.success) {
        onOptimisticRestore?.(ev);
      } else {
        onChanged?.();
      }
    });
  }

  function handleStaffReview(formData) {
    if (!isStaff) return;

    formData.append("evaluationId", ev.id);

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: `Restoring student evaluation...`,
        successLabel: `Student evaluation was restored!`,
        errorLabel: `Restoring student evaluation failed.`,
        action: reviewDisputedEvaluation,
        args: [formData],
      });
      if (result?.success) onChanged?.();
    });
  }
  return {
    open,
    setOpen,
    isPending,
    userId,
    isStaff,
    canPrint,
    total,
    totalMax,
    handleResponse,
    handleRestore,
    handleStaffReview,
  };
}
