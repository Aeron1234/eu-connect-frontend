import SideNavigation from "@/app/_components/SideNavigation";
import { ChartArea, MapPinned } from "lucide-react";

function Layout({ children }) {
  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <ChartArea className="h-5 w-5" />,
    },
    {
      name: "Map",
      href: "/admin/map",
      icon: <MapPinned className="h-5 w-5" />,
    },
  ];

  return (
    <div className="h-full grid grid-cols-[auto_1fr] gap-4">
      <SideNavigation navigation={navigation} />

      {children}
    </div>
  );
}

export default Layout;
