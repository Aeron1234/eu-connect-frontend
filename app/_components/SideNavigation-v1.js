import { getUserProfile, getUserSession } from "../_services/services";
import SideNavigationList from "./SideNavigationList";

async function SideNavigation() {
  const userProfile = await getUserProfile();

  const firstName = userProfile?.first_name || "";

  return <SideNavigationList firstName={firstName} />;
}

export default SideNavigation;
