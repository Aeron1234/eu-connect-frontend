import AccountsManager from "@/app/_components/AccountsManager";
import PageTitle from "@/app/_components/PageTitle";
import {
  getAllAccounts,
  getCreateAccountFormData,
} from "@/app/_services/admin-actions";
import { UserPlus } from "lucide-react";

export const metadata = {
  title: "Create Account",
};

export const dynamic = "force-dynamic";

async function CreateAccountPage() {
  const [formData, accountsRes] = await Promise.all([
    getCreateAccountFormData(),
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
        roles={formData?.roles || []}
        courses={formData?.courses || []}
        departments={formData?.departments || []}
        initialAccounts={accountsRes?.accounts || []}
        initialTotalPages={accountsRes?.totalPages || 1}
      />
    </main>
  );
}

export default CreateAccountPage;
