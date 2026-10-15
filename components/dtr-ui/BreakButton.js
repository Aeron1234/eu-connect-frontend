"use client";

import { Coffee, Play } from "lucide-react";
import { useTransition } from "react";
import ModalForm from "@/components/ui/ModalForm";
import { startBreak, resumeDuty } from "@/lib/server-actions/dtr-actions";
import { toastAndAction } from "@/lib/helpers";
import Modal from "../ui/Modal";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { dashboardOverviewKeys } from "@/lib/cache/dashboard-overview-queries";

export default function BreakButton({ status, record }) {
  if (
    (status !== "CLOCKED_IN" && status !== "ON_BREAK") ||
    !record?.clock_in ||
    record.clock_out != null
  ) return null;

  const onBreak = status === "ON_BREAK";
  const label = onBreak ? "Resume duty" : "Start break";
  const Icon = onBreak ? Play : Coffee;
  return <BreakAction label={label} action={onBreak ? resumeDuty : startBreak} Icon={Icon} />;
}

function BreakAction({ label, action, Icon }) {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const { user } = useUser();

  function handleAction() {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: `${label}...`,
        successLabel: label === "Start break" ? "Break started." : "Duty resumed.",
        errorLabel: `Failed to ${label.toLowerCase()}.`,
        action,
      });
      if (result?.success) {
        void queryClient.invalidateQueries({
          queryKey: dashboardOverviewKeys.role(user?.id, "student"),
        });
      }
    });
  }

  return (
    <Modal variant="confirmation"
      intent={label === "Start break" ? "break" : "resume"}
      triggerStyles="w-full sm:w-auto"
      trigger={
        <div className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-primary-500 transition-colors hover:brightness-95 sm:w-auto xl:px-5">
          <Icon className="h-5 w-5" /> {label}
        </div>
      }
      title={<span className="text-primary-emphasis">{label}?</span>}
    >
      <ModalForm.Root action={handleAction}>
        <ModalForm.Confirmation>
          {label === "Start break"
            ? "Start your break and pause your duty-hour timer?"
            : "Resume duty and continue counting your duty hours?"}
        </ModalForm.Confirmation>
        <ModalForm.Actions isPending={isPending} submitLabel={label} />
      </ModalForm.Root>
    </Modal>
  );
}
