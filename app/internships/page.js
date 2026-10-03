import { getInternshipPosts } from "@/lib/server-actions/internship-posts-actions";
import { getCourses } from "@/lib/server-actions/course-and-department-actions";

import InternshipPosts from "../../components/internship-posts-ui/InternshipPosts";
import { BriefcaseBusiness } from "lucide-react";
import { Suspense } from "react";
import InternshipPostButtonWrapper from "@/components/internship-posts-ui/InternshipPostButtonWrapper";
import PageTitle from "@/components/ui/PageTitle";

export const metadata = {
  title: "Internships",
};

export const dynamic = "force-dynamic";

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

      <Suspense fallback={<div>...</div>}>
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
