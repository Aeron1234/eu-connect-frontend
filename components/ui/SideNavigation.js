import { getUserProfile } from "@/lib/server-actions/account-actions";
import SideNavigationList from "./SideNavigationList";

async function SideNavigation() {
  // The profile badge is optional; a failed badge read must not hide the page.
  let userProfile = null;
  try {
    userProfile = await getUserProfile();
  } catch {
    // The page's own read actions can still show their error UI.
  }

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
