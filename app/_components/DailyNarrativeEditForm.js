"use client";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useTransition } from "react";
import { editNarrative } from "../_services/actions";
import { toastAndAction } from "../_services/helpers";
import DailyNarrativeForm from "./DailyNarrativeForm";

function DailyNarrativeEditForm({ narrative }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    const handlers = {
      loadingLabel: "Updating narrative...",
      successLabel: "Narrative was updated.",
      errorLabel: "Updating narrative failed.",
      action: editNarrative,
      formData,
      id: narrative.id,
    };

    startTransition(async () => await toastAndAction(handlers));
  }

  return (
    <DailyNarrativeForm
      handleAction={handleAction}
      isPending={isPending}
      type={"edit"}
      data={narrative}
    />
  );
}

export default DailyNarrativeEditForm;
