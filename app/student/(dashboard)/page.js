import InternshipRecordButton from "@/app/_components/InternshipRecordButton";
import PageTitle from "@/app/_components/PageTitle";
import { getUserProfile } from "@/app/_services/services";

export const metadata = {
  title: "Student",
};

async function DashboardPage() {
  const userProfile = await getUserProfile();

  return (
    <PageTitle title="Welcome back" name={userProfile?.first_name}>
      <InternshipRecordButton />
    </PageTitle>
  );
}

export default DashboardPage;
