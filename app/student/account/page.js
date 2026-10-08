import AccountProfile from "@/components/account-ui/AccountProfile";

export const metadata = {
  title: "Account",
  description:
    "View and manage your EU-Connect student profile and account status.",
};

function StudentAccountPage() {
  return <AccountProfile roleLabel="Student" />;
}

export default StudentAccountPage;
