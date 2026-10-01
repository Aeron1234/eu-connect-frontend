import { Clock, LogIn, LogOut } from "lucide-react";
import Modal from "./Modal";
import DtrForm from "./DtrForm";

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
          className="self-start md:self-auto flex-shrink-0 flex items-center gap-2 px-3 py-2.5 xl:py-2.5 xl:px-5 rounded-md text-sm font-semibold transition-colors text-primary-emphasis bg-card hover:bg-primary/15 whitespace-nowrap"
          title={theme.label}
        >
          {theme.icon} {theme.label}
        </div>
      }
      title={<span className={`text-primary-emphasis`}>{theme.label}?</span>}
      description={`Record your daily attendance`}
    >
      <DtrForm isOut={isOut} />
    </Modal>
  );
}

export default DtrButton;
