import InternshipRecordButton from "@/app/_components/InternshipRecordButton";
import PageTitle from "@/app/_components/PageTitle";

export const metadata = {
  title: "Student",
};

async function DashboardPage() {
  return (
    <PageTitle title="Welcome back, Student!">
      <InternshipRecordButton />
    </PageTitle>
  );
}

export default DashboardPage;
