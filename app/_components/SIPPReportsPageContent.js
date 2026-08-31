import {
  getAvailableAcademicYears,
  getHteCompanyList,
  getAnnexCReports,
} from "../_services/dept-head-actions";
import AnnexCManager from "./AnnexCManager";
import { AnnexDHteList } from "./AnnexDHteList";

async function SIPPReportsPageContent({
  userDepartment,
  userRole,
  userId,
  filter = "annex-c",
}) {
  if (filter === "annex-c") {
    const [availableAcadYear, annexCReports] = await Promise.all([
      getAvailableAcademicYears(),
      getAnnexCReports({}),
    ]);

    return (
      <AnnexCManager
        hei="Manuel S. Enverga University Foundation-Candelaria, Inc."
        address="Malabanban Norte, Candelaria, Quezon"
        availableAcadYear={availableAcadYear || []}
        initialReports={annexCReports?.reports || []}
        pagination={annexCReports?.pagination || {}}
        academicYear={annexCReports?.academicYear || ""}
      />
    );
  }

  if (filter === "annex-d") {
    const [availableAcadYear, hteCompanyList] = await Promise.all([
      getAvailableAcademicYears(),
      getHteCompanyList({}),
    ]);

    return (
      <AnnexDHteList
        availableAcadYear={availableAcadYear || []}
        initialData={hteCompanyList?.companies || []}
        pagination={hteCompanyList?.pagination || {}}
        academicYear={hteCompanyList?.academicYear || ""}
      />
    );
  }
}

export default SIPPReportsPageContent;
