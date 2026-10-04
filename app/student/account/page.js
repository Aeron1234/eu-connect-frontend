import { withReadErrorPage } from "@/lib/page-read-error";
import AccountProfile from "@/components/account-ui/AccountProfile";
import { getUserProfile } from "@/lib/server-actions/account-actions";

export const metadata = {
  title: "Account",
  description:
    "View and manage your EU-Connect student profile and account status.",
};

async function StudentAccountPage() {
  const userData = await getUserProfile();

  return <AccountProfile roleLabel="Student" userData={userData || {}} />;
}

export default withReadErrorPage(StudentAccountPage);
