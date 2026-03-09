import { getOngoingInternshipRecord } from "../_services/services";
import InternshipRecordFinishForm from "./InternshipRecordFinishForm";
import Modal from "./Modal";
import StudentInternshipForm from "./StudentInternshipForm";

async function InternshipRecordButton() {
  const internshipData = await getOngoingInternshipRecord();

  const isFinished =
    internshipData?.accumulated_hours >= internshipData?.total_hours;

  if (internshipData?.status === "ongoing" && !isFinished) return null;

  const theme = {
    buttonText: isFinished ? "Finish Internship" : "Create Internship",
    title: isFinished ? "Finish Internship" : "Create Internship",
    description: isFinished
      ? "Congratulations for finishing your internship!"
      : "Kindly fill up the details of your internship.",
    form: isFinished ? (
      <InternshipRecordFinishForm internshipId={internshipData.id} />
    ) : (
      <StudentInternshipForm />
    ),
  };

  return (
    <Modal
      trigger={
        <div className="bg-primary-500 hover:bg-primary-400 cursor-pointer rounded-md text-primary-50 font-semibold p-2 transition-colors">
          {theme.buttonText}
        </div>
      }
      title={theme.title}
      description={theme.description}
    >
      {theme.form}
    </Modal>
  );
}

export default InternshipRecordButton;
