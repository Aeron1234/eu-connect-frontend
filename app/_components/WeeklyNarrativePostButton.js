"use client";
import { Plus } from "lucide-react";
import Modal from "./Modal";
import WeeklyNarrativeForm from "./WeeklyNarrativeForm";
import { toastAndAction } from "../_services/helpers";
import { createWeeklyNarrative } from "../_services/student-actions";
import { useTransition } from "react";
import TitleButton from "./TitleButton";

function WeeklyNarrativePostButton() {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    startTransition(() =>
      toastAndAction({
        loadingLabel: "Saving narrative...",
        successLabel: "Narrative saved.",
        errorLabel: "Failed to save narrative.",
        action: createWeeklyNarrative,
        formData,
      }),
    );
  }

  return (
    <Modal
      trigger={
        <TitleButton>
          <Plus className="w-4 h-4" /> New Narrative
        </TitleButton>
      }
      title={<span>Weekly Narrative</span>}
      description="Summarize your week."
    >
      <WeeklyNarrativeForm
        handleAction={handleAction}
        isPending={isPending}
        type="post"
      />
    </Modal>
  );
}

export default WeeklyNarrativePostButton;
