import { Clock } from "lucide-react";
import Modal from "./Modal";
import DtrForm from "./DtrForm";
import {
  checkDtrStatus,
  getOngoingInternshipRecord,
} from "../_services/services";
import TriggerButton from "./TriggerButton";

async function DtrButton() {
  const internshipData = await getOngoingInternshipRecord();

  if (
    !internshipData ||
    internshipData?.accumulated_hours >= internshipData?.total_hours
  )
    return null;

  const { status } = await checkDtrStatus();

  const isOut = status === "clocked-out";
  const theme = {
    textColor: isOut
      ? "text-green-600 hover:text-green-600"
      : "text-red-600 hover:text-red-600",
    bgColor: isOut
      ? "bg-green-200 hover:bg-green-300"
      : "bg-red-200 hover:bg-red-300",
    label: isOut ? "Clock-in" : "Clock-out",
    iconColor: isOut ? "#4ade80" : "#dc2626",
  };

  return (
    <Modal
      trigger={
        <TriggerButton
          icon={<Clock />}
          textColor={theme.textColor}
          bgColor={theme.bgColor}
          label={theme.label}
        />
      }
      title={<span className={`${theme.textColor}`}>{theme.label}?</span>}
      // title={<span className="text-red-600">Clock-out?</span>}
      description={`Record your daily attendance`}
    >
      <DtrForm status={status} />
    </Modal>
  );
}

export default DtrButton;
