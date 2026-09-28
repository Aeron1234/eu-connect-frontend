import InternshipRecordsManager from "@/app/_components/InternshipRecordsManager";
import { getRegions } from "@/lib/server-actions/map-actions";

import {
  getInternshipRecords,
  getOngoingInternshipRecord,
} from "@/lib/server-actions/internship-records-actions";

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
