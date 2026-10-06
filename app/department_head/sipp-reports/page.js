import { withReadErrorPage } from "@/lib/page-read-error";
import { getUserSession } from "../../../lib/server-actions/auth";
import { FileText } from "lucide-react";
import SIPPReportsManager from "../../../components/sipp-reports-ui/SIPPReportsManager";
import {
  getAvailableAcademicYears,
  getAnnexCReports,
  getHteCompanyList,
} from "@/lib/server-actions/sipp-hte-actions";
import { notFound } from "next/navigation";

async function SIPPReportsPage() {
  const session = await getUserSession();

  const userRole = session?.user?.role;
  const userDepartment = session?.user?.department_code;

  const isRegistrar =
    userRole === "department_head" && userDepartment === "REG";

  if (!isRegistrar) return notFound();

  const [availableAcadYear, annexCReports, hteCompanyList] = await Promise.all([
    getAvailableAcademicYears(),
    getAnnexCReports({}),
    getHteCompanyList({}),
  ]);

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary-emphasis" />
          SIPP Reports
        </h1>
        <p className="text-sm text-foreground-soft mt-1">
          Review SIPP internship placement data and print official CHED annexes.
        </p>
      </div>

      <SIPPReportsManager
        hei="Manuel S. Enverga University Foundation-Candelaria, Inc."
        address="Malabanban Norte, Candelaria, Quezon"
        availableAcadYear={availableAcadYear || []}
        initialAnnexC={{
          reports: annexCReports?.reports || [],
          pagination: annexCReports?.pagination || {},
          academicYear: annexCReports?.academicYear || "",
          availableYears: annexCReports?.availableYears || [],
        }}
        initialAnnexD={{
          companies: hteCompanyList?.companies || [],
          pagination: hteCompanyList?.pagination || {},
          academicYear: hteCompanyList?.academicYear || "",
        }}
      />
    </main>
  );
}

export default withReadErrorPage(SIPPReportsPage);
