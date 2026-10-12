
import InternshipPosts from "../../components/internship-posts-ui/InternshipPosts";
import { BriefcaseBusiness } from "lucide-react";
import { Suspense } from "react";
import InternshipPostButtonWrapper from "@/components/internship-posts-ui/InternshipPostButtonWrapper";
import PageTitle from "@/components/ui/PageTitle";
import PageManual from "@/components/ui/PageManual";
import InternshipPostsSkeleton from "@/components/skeletons/InternshipPostsSkeleton";

export const metadata = {
  title: "Internships",
};

async function InternshipPage({ searchParams }) {
  const sParams = await searchParams;
  const workType = sParams.workType || "";
  const courseId = sParams.courseId || "";
  const scope = sParams.scope || "";

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitle
          Icon={BriefcaseBusiness}
          title={"Internships"}
          description={"Internship opportunities for students."}
          titleAction={<PageManual page="internships" />}
        />

        <InternshipPostButtonWrapper />
      </div>

      <Suspense fallback={<InternshipPostsSkeleton />}>
        <InternshipPosts
          workType={workType}
          courseId={courseId}
          scope={scope}
        />
      </Suspense>
    </main>
  );
}

export default InternshipPage;
