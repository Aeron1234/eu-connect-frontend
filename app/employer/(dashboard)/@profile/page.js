import EmployerProfileCard from "@/app/_components/EmployerProfileCard";
import { getUserProfile } from "@/app/_services/services";

export const metadata = {
  title: "Employer",
};

async function ProfilePage() {
  const profile = await getUserProfile();

  console.log("user profile", profile);

  return <EmployerProfileCard profile={profile} />;
}

export default ProfilePage;
