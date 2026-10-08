import AccountProfile from "@/components/account-ui/AccountProfile";

export const metadata = {
  title: "Account",
  description:
    "View and manage your EU-Connect department head profile and account status.",
};

function DepartmentHeadAccountPage() {
  return (
    <AccountProfile roleLabel="Department Head" />
  );
}
export default DepartmentHeadAccountPage;
