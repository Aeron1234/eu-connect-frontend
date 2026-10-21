"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { toastAndAction } from "@/lib/helpers";
import { postStudentEvaluation } from "@/lib/server-actions/evaluations-actions";

export default function useStudentEvaluationForm({ studentEvaluationCriterias, searchedUserId, onSubmitted }) {
  const [evaluationGrades, setEvaluationGrades] = useState(() => {
    const initialState = {};
    studentEvaluationCriterias.forEach((cat) => {
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
    submitEvaluation();
  }

  function submitEvaluation() {


    const formData = {
      student_id: searchedUserId,
      scores: [],
      other_remarks: remarks,
    };

    for (const [key, value] of Object.entries(evaluationGrades)) {
      formData.scores.push({ criterion_name: key, score: value });
    }

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Posting student evaluation...",
        successLabel: "Student evaluation posted!",
        errorLabel: "Posting student evaluation failed.",
        action: postStudentEvaluation,
        args: [formData],
      });

      if (!result?.success) {
        return;
      }

      setEvaluationGrades(() => {
        const initialState = {};
        studentEvaluationCriterias.forEach((cat) => {
          cat.items.forEach((item) => {
            initialState[item.id] = null;
          });
        });
        return initialState;
      });

      setRemarks("");
      void queryClient.invalidateQueries({ queryKey: ["evaluation-posting"] });
      onSubmitted?.();
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
