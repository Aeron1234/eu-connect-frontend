import { getUserSession } from "../../_services/services";

import { FileText } from "lucide-react";
import SIPPReportsPageContent from "../../_components/SIPPReportsPageContent";
import SIPPPageFilter from "../../_components/SIPPPageFilter";
import { notFound } from "next/navigation";

async function SIPPReportsPage({ searchParams }) {
  const session = await getUserSession();
  const sParams = await searchParams;

  const userId = session?.user?.id;
  const userRole = session?.user?.role;
  const userDepartment = session?.user?.department_code;

  const isRegistrar = userRole == "department_head" && userDepartment === "REG";

  if (!isRegistrar) return notFound();

  const filter = sParams.filter || "annex-c";

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2">
            <FileText className="w-7 h-7 text-primary-500" />
            SIPP Reports
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Review SIPP internship placement data and print official CHED
            annexes.
          </p>
        </div>
      </div>

      {isRegistrar && <SIPPPageFilter filter={filter} />}

      <div className="space-y-6">
        <SIPPReportsPageContent
          userId={userId}
          userRole={userRole}
          userDepartment={userDepartment}
          filter={filter}
        />
      </div>
    </main>
  );
}

export default SIPPReportsPage;
