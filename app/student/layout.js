import SideNavigation from "@/app/_components/SideNavigation";
import { Spinner } from "@/components/ui/spinner";
import { ChartArea, Folder } from "lucide-react";
import { Suspense } from "react";

function Layout({ children }) {
  const navigation = [
    {
      name: "Dashboard",
      href: "/student",
      icon: <ChartArea className="h-5 w-5" />,
    },
    {
      name: "Storage",
      href: "/student/storage",
      icon: <Folder className="h-5 w-5" />,
    },
  ];

  return (
    <div className="h-full grid grid-cols-[auto_1fr] mx-auto max-w-7xl gap-4">
      <SideNavigation navigation={navigation} />

      {children}
    </div>
  );
}

export default Layout;
