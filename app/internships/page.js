import { getCourses, getInternshipPosts } from "../_services/services";

import InternshipPosts from "../_components/InternshipPosts";
import { BriefcaseBusiness } from "lucide-react";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import InternshipPostButtonWrapper from "../_components/InternshipPostButtonWrapper";
import PageTitle from "../_components/PageTitle";

export const metadata = {
  title: "Internships",
};

async function InternshipPage({ searchParams }) {
  const sParams = await searchParams;
  const workType = sParams.workType || "";
  const courseId = sParams.courseId || "";
  const scope = sParams.scope || "";

  const [courses, internshipPosts] = await Promise.all([
    getCourses(),
    getInternshipPosts({
      workType,
      courseId,
      mine: scope === "myposts" ? "true" : "",
    }),
  ]);

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitle
          Icon={BriefcaseBusiness}
          title={"Internships"}
          description={"Internship opportunities for students."}
        />

        <InternshipPostButtonWrapper courses={courses || []} />
      </div>

      <Suspense
        fallback={
          <div className="self-center justify-self-center p-5">
            <span className="sr-only">Loading Internship posts...</span>
            <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
          </div>
        }
      >
        <InternshipPosts
          internshipPosts={internshipPosts?.data || []}
          pagination={internshipPosts?.pagination || {}}
          courses={courses || []}
          workType={workType}
          courseId={courseId}
          scope={scope}
        />
      </Suspense>
    </main>
  );
}

export default InternshipPage;
