import EmployerProfileCard from "@/components/dashboard-ui/EmployerProfileCard";
import { getUserProfile } from "@/lib/server-actions/account-actions";

async function ProfilePage() {
  const profile = await getUserProfile();

  return <EmployerProfileCard profile={profile} />;
}

export default ProfilePage;
