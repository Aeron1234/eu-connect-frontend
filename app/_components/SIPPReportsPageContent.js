import {
  getAvailableAcademicYears,
  getHteCompanyList,
} from "../_services/dept-head-actions";
import AnnexC from "./AnnexC";
import { AnnexDHteList } from "./AnnexDHteList";

function SIPPReportsPageContent({
  userDepartment,
  userRole,
  userId,
  filter = "annex-c",
}) {
  if (userDepartment === "REG" || userRole === "admin")
    return (
      <RegistrarUser
        userDepartment={userDepartment}
        userRole={userRole}
        userId={userId}
        filter={filter}
      />
    );

  return <div>Normal Dept head</div>;
}

async function RegistrarUser({
  userDepartment,
  userRole,
  userId,
  filter = "annex-c",
}) {
  const [availableAcadYear, hteCompanyList] = await Promise.all([
    getAvailableAcademicYears(),
    getHteCompanyList({}),
  ]);

  console.log(hteCompanyList);
  if (filter === "annex-c") return <AnnexC />;

  if (filter === "annex-d") {
    return (
      <AnnexDHteList
        availableAcadYear={availableAcadYear || []}
        initialData={getHteCompanyList?.companies || []}
        pagination={getHteCompanyList?.pagination || {}}
        academicYear={getHteCompanyList?.academicYear || ""}
      />
    );
  }
}

export default SIPPReportsPageContent;
