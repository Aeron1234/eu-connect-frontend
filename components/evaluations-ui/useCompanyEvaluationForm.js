"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { toastAndAction } from "@/lib/helpers";
import { postCompanyEvaluation } from "@/lib/server-actions/evaluations-actions";

// The student submits a Company Evaluation of their ongoing internship company.
// Posting is direct; reset scores and refresh availability only after confirmed success.
export default function useCompanyEvaluationForm({ companyEvaluationCriterias, onSubmitted }) {
  const [evaluationGrades, setEvaluationGrades] = useState(() => {
    const initialState = {};
    companyEvaluationCriterias.forEach((cat) => {
      cat.items.forEach((item) => {
        initialState[item.id] = null;
      });
    });

    return initialState;
  });
  const queryClient = useQueryClient();
  const [remarks, setRemarks] = useState("");
  const [isPending, startTransition] = useTransition();

  const grades = [0, 1, 2, 3, 4, 5];

  async function handleEvaluation(e) {
    e.preventDefault();

    const formData = {
      scores: [],
      other_remarks: remarks,
    };

    for (const [key, value] of Object.entries(evaluationGrades)) {
      formData.scores.push({ criterion_id: Number(key), score: value });
    }

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Posting company evaluation...",
        successLabel: "Company evaluation posted!",
        errorLabel: "Posting company evaluation failed.",
        action: postCompanyEvaluation,
        args: [formData],
      });

      if (!result?.success) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["evaluation-posting"] });
      onSubmitted?.();

      setEvaluationGrades(() => {
        const initialState = {};
        companyEvaluationCriterias.forEach((cat) => {
          cat.items.forEach((item) => {
            initialState[item.id] = null;
          });
        });
        return initialState;
      });

      setRemarks("");
    });
  }
  return {
    evaluationGrades,
    setEvaluationGrades,
    grades,
    remarks,
    setRemarks,
    isPending,
    handleEvaluation,
  };
}
