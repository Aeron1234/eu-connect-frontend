import AccountsManager from "@/components/account-ui/AccountsManager";
import PageTitle from "@/components/ui/PageTitle";
import PageManual from "@/components/ui/PageManual";
import { UserPlus } from "lucide-react";

export const metadata = {
  title: "Create Account",
};

function CreateAccountPage() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <PageTitle
        Icon={UserPlus}
        title={"Create Account"}
        description={
          "Create and manage student, employer, and department head accounts."
        }
        titleAction={<PageManual page="admin-accounts" />}
      />

      <AccountsManager />
    </main>
  );
}

export default CreateAccountPage;
