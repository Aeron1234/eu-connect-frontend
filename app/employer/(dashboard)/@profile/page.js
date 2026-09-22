import EmployerProfileCard from "@/app/_components/EmployerProfileCard";
import { getUserProfile } from "@/app/_services/services";

export const metadata = {
  title: "Employer",
};
export const dynamic = "force-dynamic";

async function ProfilePage() {
  const profile = await getUserProfile();

  return <EmployerProfileCard profile={profile} />;
}

export default ProfilePage;
