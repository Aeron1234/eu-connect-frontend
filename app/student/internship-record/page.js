import InternshipRecordsManager from "@/app/_components/InternshipRecordsManager";
import {
  getInternshipRecords,
  getOngoingInternshipRecord,
  getRegions,
} from "@/app/_services/services";

export const metadata = {
  title: "Internship Records",
};

async function InternshipRecordPage() {
  const [userInternshipData, regions, recordStatus] = await Promise.all([
    getInternshipRecords(),
    getRegions(),
    getOngoingInternshipRecord(),
  ]);

  return (
    <InternshipRecordsManager
      initialRecords={userInternshipData || []}
      regions={regions || []}
      recordStatus={recordStatus?.status}
    />
  );
}

export default InternshipRecordPage;
