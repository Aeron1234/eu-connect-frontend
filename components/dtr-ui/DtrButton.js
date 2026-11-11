"use client";

import { LogIn, LogOut } from "lucide-react";
import Modal from "../ui/Modal";
import DtrForm from "./DtrForm";
import { useState } from "react";
import {useQuery} from "@tanstack/react-query";
import {dutyOptions} from "@/lib/cache/duty-queries";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { dtrKeys } from "@/lib/cache/dtr-queries";
import { dashboardOverviewKeys } from "@/lib/cache/dashboard-overview-queries";

function DtrButton({ internshipData, status, record, disabled = false, pendingExplanation = false }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUser();
  const dutyQuery=useQuery({...dutyOptions(user?.id),enabled:Boolean(user?.id && internshipData?.status==="ongoing")});
  // Refresh attendance only after a successful write. The DTR form closes the
  // confirmation after either result, leaving its success/error toast visible.
  function handleSuccess() {
    void queryClient.invalidateQueries({queryKey:["dtr-duty",user?.id]});
    void queryClient.invalidateQueries({
      queryKey: dtrKeys.student(user?.id, internshipData?.id),
    });
    void queryClient.invalidateQueries({
      queryKey: dashboardOverviewKeys.role(user?.id, "student"),
    });
  }
  const hasOpenShift = Boolean(record?.clock_in && !record.clock_out && !record.auto_closed);
  if (
    !internshipData ||
    status === "ON_BREAK" ||
    (status !== "CLOCKED_OUT" && !hasOpenShift) ||
    (status === "CLOCKED_OUT" && hasOpenShift) ||
    (status === "CLOCKED_OUT" && pendingExplanation) ||
    internshipData?.accumulated_hours >= internshipData?.total_hours
  )
    return null;

  const isOut = status === "CLOCKED_OUT";
  if(isOut && !dutyQuery.data?.access?.open) return <p className="max-w-sm text-xs text-white/85" role="status">{dutyQuery.isPending?'Checking duty schedule...':dutyQuery.isError?'Could not verify your schedule. Retry in the schedule panel.':dutyQuery.data?.access?.message||'Set your duty schedule below before clocking in.'}</p>;
  const theme = {
    label: isOut ? "Clock in" : "Clock out",
    icon: isOut ? (
      <LogIn className="h-5 w-5" />
    ) : (
      <LogOut className="h-5 w-5" />
    ),
  };

  if (disabled) {
    const explanation = "DTR is unavailable before the internship start date";
    return (
      <div className="w-full sm:w-auto">
        <button type="button" disabled className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-white/60 px-4 py-2.5 text-sm font-semibold text-primary/70 sm:w-auto" title={explanation}>
          {theme.icon} {theme.label}
        </button>
      </div>
    );
  }

  return (
    <Modal variant="confirmation"
      intent={isOut ? "clock-in" : "clock-out"}
      open={open}
      onOpenChange={setOpen}
      triggerStyles="w-full sm:w-auto"
      trigger={
        <div
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-medium text-primary transition hover:bg-white/90 sm:w-auto"
          title={theme.label}
        >
          {theme.icon} {theme.label}
        </div>
      }
      title={<span className={`text-primary-emphasis`}>{theme.label}?</span>}
    >
      <DtrForm isOut={isOut} onSuccess={handleSuccess} onSettled={() => setOpen(false)} />
    </Modal>
  );
}

export default DtrButton;
