import HoursProgressDonut from "@/app/_components/HoursProgressDonut";
import { getOngoingInternshipRecord } from "@/app/_services/services";

async function DoughnutPage() {
  const internshipData = await getOngoingInternshipRecord();

  if (!internshipData) return null;

  return <HoursProgressDonut internshipData={internshipData} />;
}

export default DoughnutPage;
