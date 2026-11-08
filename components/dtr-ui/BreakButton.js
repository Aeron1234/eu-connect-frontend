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
import { dtrKeys } from "@/lib/cache/dtr-queries";

export default function BreakButton({ status, record, internshipId }) {
  if (
    (status !== "CLOCKED_IN" && status !== "ON_BREAK") ||
    !record?.clock_in ||
    record.clock_out != null ||
    record.auto_closed
  ) return null;

  const onBreak = status === "ON_BREAK";
  const label = onBreak ? "Resume duty" : "Start break";
  const Icon = onBreak ? Play : Coffee;
  return <BreakAction label={label} action={onBreak ? resumeDuty : startBreak} Icon={Icon} internshipId={internshipId} />;
}

function BreakAction({ label, action, Icon, internshipId }) {
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
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: dashboardOverviewKeys.role(user?.id, "student"),
          }),
          queryClient.invalidateQueries({
            queryKey: dtrKeys.student(user?.id, internshipId),
          }),
        ]);
      }
    });
  }

  return (
    <Modal variant="confirmation"
      intent={label === "Start break" ? "break" : "resume"}
      triggerStyles="w-full sm:w-auto"
      trigger={
        <div className="flex w-full items-center justify-center gap-2 rounded-md border border-white/70 bg-transparent px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10 sm:w-auto">
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
