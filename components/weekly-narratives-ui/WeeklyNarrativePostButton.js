"use client";
import { Plus } from "lucide-react";
import Modal from "../ui/Modal";
import WeeklyNarrativeForm from "./WeeklyNarrativeForm";
import { toastAndAction } from "../../lib/helpers";
import { createWeeklyNarrative } from "@/lib/server-actions/weekly-narratives-actions";
import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { weeklyNarrativesKeys } from "@/lib/cache/weekly-narratives-queries";
import TitleButton from "../ui/TitleButton";

function WeeklyNarrativePostButton() {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const { user } = useUser();

  function handleAction(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Saving narrative...",
        successLabel: "Narrative saved.",
        errorLabel: "Failed to save narrative.",
        action: createWeeklyNarrative,
        formData,
      });
      if (result?.success) {
        queryClient.setQueriesData({ queryKey: weeklyNarrativesKeys.all(user.id) }, (old) =>
          old?.pages?.length
            ? { pages: [old.pages[0]], pageParams: [1] }
            : old,
        );
        void queryClient.invalidateQueries({ queryKey: weeklyNarrativesKeys.all(user.id) });
      }
    });
  }

  return (
    <Modal
      triggerStyles="w-full sm:w-auto"
      trigger={
        <TitleButton>
          <Plus className="w-4 h-4" /> New Narrative
        </TitleButton>
      }
      title={<span>Weekly Narrative</span>}
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
