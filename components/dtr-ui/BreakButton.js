"use client";

import { Coffee, Play } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { startBreak, resumeDuty } from "@/lib/server-actions/dtr-actions";
import { toastAndAction } from "@/lib/helpers";
import Modal from "../ui/Modal";

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

  function handleAction(formData) {
    startTransition(async () => {
      await toastAndAction({
        loadingLabel: `${label}...`,
        successLabel: label === "Start break" ? "Break started." : "Duty resumed.",
        errorLabel: `Failed to ${label.toLowerCase()}.`,
        action,
        formData,
      });
    });
  }

  return (
    <Modal
      triggerStyles="w-full sm:w-auto"
      trigger={
        <div className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-primary-500 transition-colors hover:brightness-95 sm:w-auto xl:px-5">
          <Icon className="h-5 w-5" /> {label}
        </div>
      }
      title={<span className="text-primary-emphasis">{label}?</span>}
      description={label === "Start break"
        ? "Break time won't count toward your duty hours."
        : "Your duty-hour timer will continue when you resume."}
    >
      <form action={handleAction}>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner className="size-5" /> : label}
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </Modal>
  );
}
