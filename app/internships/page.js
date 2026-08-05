import { redirect } from "next/navigation";
import {
  getCourses,
  getInternshipPosts,
  getUserSession,
} from "../_services/services";

import InternshipPosts from "../_components/InternshipPosts";
import { Briefcase, Plus } from "lucide-react";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

async function InternshipPage({ searchParams }) {
  const session = await getUserSession();
  if (!session?.user) redirect("/login");
  const userRole = session.user.role;

  const sParams = await searchParams;

  const courseFilter = sParams.course || "all";
  const workTypeFilter = sParams.work_type || "all";
  const scopeFilter = sParams.scope || "all";

  const [courses, internshipPosts] = await Promise.all([
    getCourses(),
    getInternshipPosts({}),
  ]);

  console.log(internshipPosts);

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2">
              <Briefcase className="w-7 h-7 text-primary-500" />
              Internship Documents Storage
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Upload all of your internship-related files here
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition cursor-pointer shrink-0">
            <Plus className="w-4 h-4" />
            <span className="text-white text-sm font-semibold">Post Job</span>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="self-center justify-self-center p-5">
              <span className="sr-only">Loading profile records...</span>
              <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
            </div>
          }
        >
          <InternshipPosts
            courseFilter={courseFilter}
            workTypeFilter={workTypeFilter}
            scopeFilter={scopeFilter}
            internshipPosts={internshipPosts?.data || []}
            pagination={internshipPosts?.pagination || {}}
            userRole={userRole}
            courses={courses || []}
          />
        </Suspense>
      </div>
    </main>
  );
}

export default InternshipPage;
