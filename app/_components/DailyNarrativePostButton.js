"use client";
import { NotebookPen, Plus } from "lucide-react";
import Modal from "./Modal";
import TriggerButton from "./TriggerButton";
import DailyNarrativeForm from "./DailyNarrativeForm";
import { toastAndAction } from "../../lib/helpers";
import { createNarrative } from "../_services/student-actions";
import { useTransition } from "react";

function DailyNarrativePostButton() {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    startTransition(() =>
      toastAndAction({
        loadingLabel: "Saving narrative...",
        successLabel: "Narrative saved.",
        errorLabel: "Failed to save narrative.",
        action: createNarrative,
        formData,
      }),
    );
  }

  return (
    <Modal
      trigger={
        <div
          // onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> New Narrative
        </div>
      }
      title={<span>Daily Narrative</span>}
      description={`Post what happened today.`}
    >
      <DailyNarrativeForm
        handleAction={handleAction}
        isPending={isPending}
        type={"post"}
      />
    </Modal>
  );
}

export default DailyNarrativePostButton;
