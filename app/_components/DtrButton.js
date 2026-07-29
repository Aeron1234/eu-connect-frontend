import { Clock, LogIn, LogOut } from "lucide-react";
import Modal from "./Modal";
import DtrForm from "./DtrForm";
import TriggerButton from "./TriggerButton";

function DtrButton({ internshipData, status }) {
  if (
    !internshipData ||
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
      trigger={
        <div
          className="self-start md:self-auto flex items-center gap-2  px-3 py-2.5 xl:py-2.5 xl:px-5 rounded-md text-sm font-semibold transition-colors text-primary-500 bg-white hover:bg-primary-50/90"
          title={theme.label}
        >
          {theme.icon} {theme.label}
        </div>
      }
      title={<span className={`text-primary-500`}>{theme.label}?</span>}
      // title={<span className="text-red-600">Clock-out?</span>}
      description={`Record your daily attendance`}
    >
      <DtrForm isOut={isOut} />
    </Modal>
  );
}

export default DtrButton;
