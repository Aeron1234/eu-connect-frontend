import { redirect } from "next/navigation";
import { getUserSession } from "../_services/services";
import { Briefcase, Plus } from "lucide-react";
import InternshipPosts from "../_components/InternshipPosts";

async function InternshipPage() {
  const session = await getUserSession();
  if (!session?.user) redirect("/login");

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <InternshipPosts />
      </div>
    </main>
  );
}

export default InternshipPage;
