import { withReadErrorPage } from "@/lib/page-read-error";
import EmployerProfileCard from "@/components/dashboard-ui/EmployerProfileCard";
import { getUserProfile } from "@/lib/server-actions/account-actions";

export const metadata = {
  title: "Employer",
};
export const dynamic = "force-dynamic";

async function ProfilePage() {
  const profile = await getUserProfile();

  return <EmployerProfileCard profile={profile} />;
}

export default withReadErrorPage(ProfilePage);
