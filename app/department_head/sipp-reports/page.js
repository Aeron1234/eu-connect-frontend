import { withReadErrorPage } from "@/lib/page-read-error";
import { getUserSession } from "../../../lib/server-actions/auth";
import { FileText } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";
import PageManual from "@/components/ui/PageManual";
import SIPPReportsManager from "../../../components/sipp-reports-ui/SIPPReportsManager";
import { notFound } from "next/navigation";

async function SIPPReportsPage({ searchParams }) {
  const params=await searchParams || {};
  const year=/^\d{4}-\d{4}$/.test(params.year||'')?params.year:'';
  const status=['draft','submitted'].includes(params.status)?params.status:'';
  const session = await getUserSession();

  const userRole = session?.user?.role;
  const userDepartment = session?.user?.department_code;

  const isRegistrar =
    userRole === "department_head" && userDepartment === "REG";

  if (!isRegistrar) return notFound();

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
      <PageTitle Icon={FileText} title="SIPP Reports" description="Review internship placements and export official CHED annexes." titleAction={<PageManual page="sipp" />} />

      <SIPPReportsManager
        initialScope={params.tab === 'annex-d' ? 'annex-d' : 'annex-c'}
        initialAnnexC={params.tab === 'annex-c' ? { academicYear:year, status, tab:'reports' } : undefined}
        initialAnnexD={params.tab === 'annex-d' ? { academicYear:year } : undefined}
        hei="Manuel S. Enverga University Foundation-Candelaria, Inc."
        address="Malabanban Norte, Candelaria, Quezon"
      />
    </div>
  );
}

export default withReadErrorPage(SIPPReportsPage);
