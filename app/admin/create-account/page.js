import AccountsManager from "@/app/_components/AccountsManager";
import PageTitle from "@/app/_components/PageTitle";
import { getAllAccounts } from "@/app/_services/admin-actions";
import { getCourses, getDepartments, getRoles } from "@/app/_services/services";
import { UserPlus } from "lucide-react";

export const metadata = {
  title: "Create Account",
};

async function CreateAccountPage() {
  const [roles, courses, departments, accountsRes] = await Promise.all([
    getRoles(),
    getCourses(),
    getDepartments(),
    getAllAccounts({ filter: "all", search: "", page: 1 }),
  ]);

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <PageTitle
        Icon={UserPlus}
        title={"Create Account"}
        description={
          "Create and manage student, employer, and department head accounts."
        }
      />

      <AccountsManager
        roles={roles || []}
        courses={courses || []}
        departments={departments || []}
        initialAccounts={accountsRes?.accounts || []}
        initialTotalPages={accountsRes?.totalPages || 1}
      />
    </main>
  );
}

export default CreateAccountPage;
