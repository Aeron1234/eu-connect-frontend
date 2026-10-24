import { withReadErrorPage } from "@/lib/page-read-error";
import { getUserSession } from "../../../lib/server-actions/auth";
import { FileText } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";
import PageManual from "@/components/ui/PageManual";
import SIPPReportsManager from "../../../components/sipp-reports-ui/SIPPReportsManager";
import { notFound } from "next/navigation";

async function SIPPReportsPage() {
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
        hei="Manuel S. Enverga University Foundation-Candelaria, Inc."
        address="Malabanban Norte, Candelaria, Quezon"
      />
    </div>
  );
}

export default withReadErrorPage(SIPPReportsPage);
