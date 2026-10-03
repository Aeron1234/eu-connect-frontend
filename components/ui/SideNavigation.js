import { getUserProfile } from "@/lib/server-actions/account-actions";
import SideNavigationList from "./SideNavigationList";

async function SideNavigation() {
  const userProfile = await getUserProfile();

  const firstName = userProfile?.first_name || "";
  const fullName = [firstName, userProfile?.last_name].filter(Boolean).join(" ");

  return (
    <SideNavigationList
      firstName={firstName}
      fullName={fullName}
      avatar={userProfile?.avatar || null}
    />
  );
}

export default SideNavigation;
