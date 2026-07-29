import InternshipRecordButton from "@/app/_components/InternshipRecordButton";
import PageTitle from "@/app/_components/PageTitle";
import { getUserProfile } from "@/app/_services/services";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Student",
};

async function DashboardPage() {
  const userProfile = await getUserProfile();

  return (
    <PageTitle
      title="Welcome back"
      description="Use the DTR and Narratives to track your progress"
      name={userProfile?.first_name}
    >
      {/* <InternshipRecordButton /> */}
      <Link
        href={"/student/internship-record"}
        className="flex text-sm items-center gap-1 rounded-sm self-center cursor-pointer transition-all hover:text-primary-500 hover:underline"
      >
        Create Internship Record
        <span>
          <ArrowRight className="h-4 w-4" />
        </span>
      </Link>
    </PageTitle>
  );
}

export default DashboardPage;
