import AccountProfile from "@/app/_components/AccountProfile";
import { getUserProfile } from "@/app/_services/services";

export const metadata = {
  title: "Account",
  description:
    "View and manage your EU-Connect department head profile and account status.",
};

async function DepartmentHeadAccountPage() {
  const userData = await getUserProfile();

  return (
    <AccountProfile roleLabel="Department Head" userData={userData || {}} />
  );
}
export default DepartmentHeadAccountPage;
