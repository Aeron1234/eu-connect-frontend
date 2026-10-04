import { withReadErrorPage } from "@/lib/page-read-error";
import AccountProfile from "@/components/account-ui/AccountProfile";
import { getUserProfile } from "@/lib/server-actions/account-actions";

export const metadata = {
  title: "Account",
  description:
    "View and manage your EU-Connect administrator profile and account status.",
};

async function AdminAccountPage() {
  const userData = await getUserProfile();

  return <AccountProfile roleLabel="Administrator" userData={userData || {}} />;
}

export default withReadErrorPage(AdminAccountPage);
