"use client";
import { Plus } from "lucide-react";
import Modal from "./Modal";
import TriggerButton from "./TriggerButton";
import DailyNarrativeForm from "./DailyNarrativeForm";
import { useActionState } from "react";
import { toastAndAction } from "../_services/helpers";
import { createNarrative } from "../_services/actions";

function DailyNarrativePostButton() {
  const [state, formAction, isPending] = useActionState(createNarrative, null);

  async function handleAction(formData) {
    const handlers = {
      loadingLabel: "Adding narrative...",
      successLabel: "Narrative was added.",
      errorLabel: "Adding narrative failed.",
      action: createNarrative,
      formData,
    };

    await toastAndAction(handlers);
  }

  return (
    <Modal
      trigger={
        <TriggerButton
          icon={<Plus />}
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
