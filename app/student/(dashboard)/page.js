import InternshipRecordButton from "@/app/_components/InternshipRecordButton";
import PageTitle from "@/app/_components/PageTitle";
import { getStudentUserProfile } from "@/app/_services/services";

export const metadata = {
  title: "Student",
};

async function DashboardPage() {
  const { first_name } = await getStudentUserProfile();

  return (
    <PageTitle title="Welcome back" name={first_name}>
      <InternshipRecordButton />
    </PageTitle>
  );
}

export default DashboardPage;
