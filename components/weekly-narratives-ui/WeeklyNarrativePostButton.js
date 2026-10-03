"use client";
import { Plus } from "lucide-react";
import Modal from "../ui/Modal";
import WeeklyNarrativeForm from "./WeeklyNarrativeForm";
import { toastAndAction } from "../../lib/helpers";
import { createWeeklyNarrative } from "@/lib/server-actions/weekly-narratives-actions";
import { useTransition } from "react";
import TitleButton from "../ui/TitleButton";

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
