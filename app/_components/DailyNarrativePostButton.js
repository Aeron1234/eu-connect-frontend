"use client";
import { NotebookPen, Plus } from "lucide-react";
import Modal from "./Modal";
import TriggerButton from "./TriggerButton";
import DailyNarrativeForm from "./DailyNarrativeForm";
import { toastAndAction } from "../_services/helpers";
import { createNarrative } from "../_services/student-actions";
import { useTransition } from "react";

function DailyNarrativePostButton() {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    startTransition(() =>
      toastAndAction({
        loadingLabel: "Deleting narrative...",
        successLabel: "Narrative deleted.",
        errorLabel: "Failed to delete.",
        action: createNarrative,
        formData,
      }),
    );
  }

  // useEffect(() => {
  //   if (!state) return;

  //   if (state.success) {
  //     toast.success(state.message || "Narrative added");
  //   } else {
  //     toast.error(state.error || "Failed");
  //   }
  // }, [state]);

  return (
    <Modal
      trigger={
        <TriggerButton
          icon={<NotebookPen size={16} />}
          textColor={"text-primary-50 "}
          bgColor={"bg-primary-500"}
          label={"Post"}
        />
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
