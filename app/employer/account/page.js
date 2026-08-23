import AccountProfile from "@/app/_components/AccountProfile";
import { getUserProfile } from "@/app/_services/services";

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
