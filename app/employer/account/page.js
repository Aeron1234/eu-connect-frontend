import AccountProfile from "@/components/account-ui/AccountProfile";
import { getUserProfile } from "@/lib/server-actions/account-actions";

export const metadata = {
  title: "Account",
  description:
    "View and manage your EU-Connect employer profile and account status.",
};

async function EmployerAccountPage() {
  const userData = await getUserProfile();

  return <AccountProfile roleLabel="Employer" userData={userData || {}} />;
}

export default EmployerAccountPage;
