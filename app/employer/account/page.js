import AccountProfile from "@/components/account-ui/AccountProfile";

export const metadata = {
  title: "Account",
  description:
    "View and manage your EU-Connect employer profile and account status.",
};

function EmployerAccountPage() {
  return <AccountProfile roleLabel="Employer" />;
}

export default EmployerAccountPage;
