import { getUserSession } from "../_services/services";
import SideNavigationList from "./SideNavigationList";

async function SideNavigation() {
  const session = await getUserSession();
  if (!session?.user) return null;

  const userRole = session.user.role;

  return <SideNavigationList userRole={userRole} />;
}

export default SideNavigation;
