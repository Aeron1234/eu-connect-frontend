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
import InternshipPostButtonWrapper from "../_components/InternshipPostButtonWrapper";

export const metadata = {
  title: "Internships",
};

async function InternshipPage({ searchParams }) {
  const [courses, internshipPosts] = await Promise.all([
    getCourses(),
    getInternshipPosts({}),
  ]);

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
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

        <InternshipPostButtonWrapper courses={courses || []} />
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
          internshipPosts={internshipPosts?.data || []}
          pagination={internshipPosts?.pagination || {}}
          courses={courses || []}
        />
      </Suspense>
    </main>
  );
}

export default InternshipPage;
