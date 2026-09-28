import AccountProfile from "@/app/_components/AccountProfile";
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

export default AdminAccountPage;
