import { getUserProfile } from "@/lib/server-actions/account-actions";
import SideNavigationList from "./SideNavigationList";

async function SideNavigation() {
  const userProfile = await getUserProfile();

  const firstName = userProfile?.first_name || "";

  return <SideNavigationList firstName={firstName} />;
}

export default SideNavigation;
