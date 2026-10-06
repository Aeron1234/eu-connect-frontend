"use client";

import { LogIn, LogOut } from "lucide-react";
import Modal from "../ui/Modal";
import DtrForm from "./DtrForm";
import { useState } from "react";

function DtrButton({ internshipData, status }) {
  const [open, setOpen] = useState(false);
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

  return (
    <Modal
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
      <DtrForm isOut={isOut} onSuccess={() => setOpen(false)} />
    </Modal>
  );
}

export default DtrButton;
