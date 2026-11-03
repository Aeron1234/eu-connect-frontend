"use client";

import { LogIn, LogOut } from "lucide-react";
import Modal from "../ui/Modal";
import DtrForm from "./DtrForm";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { dtrKeys } from "@/lib/cache/dtr-queries";
import { dashboardOverviewKeys } from "@/lib/cache/dashboard-overview-queries";

function DtrButton({ internshipData, status, disabled = false }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUser();
  // Refresh attendance only after a successful write. The DTR form closes the
  // confirmation after either result, leaving its success/error toast visible.
  function handleSuccess() {
    void queryClient.invalidateQueries({
      queryKey: dtrKeys.student(user?.id, internshipData?.id),
    });
    void queryClient.invalidateQueries({
      queryKey: dashboardOverviewKeys.role(user?.id, "student"),
    });
  }
  if (
    !internshipData ||
    status === "ON_BREAK" ||
    internshipData?.accumulated_hours >= internshipData?.total_hours
  )
    return null;

  const isOut = status === "CLOCKED_OUT";
  const theme = {
    label: isOut ? "Clock in" : "Clock out",
    icon: isOut ? (
      <LogIn className="h-5 w-5" />
    ) : (
      <LogOut className="h-5 w-5" />
    ),
  };

  if (disabled) {
    return (
      <button type="button" disabled className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-white/60 px-4 py-2.5 text-sm font-semibold text-primary/70 sm:w-auto" title="DTR is unavailable before the internship start date">
        {theme.icon} {theme.label}
      </button>
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
          className="inline-flex items-center justify-center gap-2 bg-white text-primary px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition w-full sm:w-auto"
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
