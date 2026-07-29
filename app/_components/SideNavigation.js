import { getUserProfile, getUserSession } from "../_services/services";
import SideNavigationList from "./SideNavigationList";

async function SideNavigation() {
  const [session, userProfile] = await Promise.all([
    getUserSession(),
    getUserProfile(),
  ]);

  if (!session?.user) return null;

  const userRole = session.user.role;
  const firstName = userProfile?.first_name || "";

  return <SideNavigationList userRole={userRole} firstName={firstName} />;
}

export default SideNavigation;
