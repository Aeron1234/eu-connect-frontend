import { Clock } from "lucide-react";
import Modal from "./Modal";
import DtrForm from "./DtrForm";
import TriggerButton from "./TriggerButton";

function DtrButton({ internshipData, status }) {
  if (
    !internshipData ||
    internshipData?.accumulated_hours >= internshipData?.total_hours
  )
    return null;

  const isOut = status === "clocked-out";
  const theme = {
    textColor: "text-white",
    bgColor: "bg-primary-500 hover:bg-primary-400",
    label: isOut ? "Clock-in" : "Clock-out",
    iconColor: "#fff",
  };

  return (
    <Modal
      trigger={
        <TriggerButton
          icon={<Clock size={16} />}
          textColor={theme.textColor}
          bgColor={theme.bgColor}
          label={theme.label}
        />
      }
      title={<span className={`text-primary-500`}>{theme.label}?</span>}
      // title={<span className="text-red-600">Clock-out?</span>}
      description={`Record your daily attendance`}
    >
      <DtrForm status={status} />
    </Modal>
  );
}

export default DtrButton;
