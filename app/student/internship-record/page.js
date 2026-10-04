import { withReadErrorPage } from "@/lib/page-read-error";
import InternshipRecordsManager from "@/components/internship-records-ui/InternshipRecordsManager";
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

export default withReadErrorPage(InternshipRecordPage);
