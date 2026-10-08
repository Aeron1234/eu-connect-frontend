import AccountProfile from "@/components/account-ui/AccountProfile";

export const metadata = {
  title: "Account",
  description:
    "View and manage your EU-Connect administrator profile and account status.",
};

function AdminAccountPage() {
  return <AccountProfile roleLabel="Administrator" />;
}

export default AdminAccountPage;
