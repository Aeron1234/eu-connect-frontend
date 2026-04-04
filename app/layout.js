import Header from "./_components/Header";
// import "./_styles/globals.css";
import "@/app/_styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DM_Sans } from "next/font/google";
import SideNavigation from "./_components/SideNavigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppContainer from "./_components/AppContainer";

const DmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    template: "EU-Connect / %s",
    default: "EU-Connect",
  },
  description:
    "Internship Management System of College Department of Enverga University Candelaria",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${DmSans.className} `}>
        {/* <body
        className={`${DmSans.className} relative grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] max-md:grid-rows-[auto_1fr_auto] max-md:grid-cols-1 h-screen antialiased text-stone-800 overflow-x-hidden`}
      > */}

        {/* className={`relative grid ${pathName === "/login" ? "grid-cols-1" : "grid-cols-[auto_1fr] max-lg:grid-cols-1"} grid-rows-[auto_1fr] max-lg:grid-rows-[auto_1fr_auto] h-screen antialiased text-stone-800 overflow-x-hidden`} */}

        {/* <div className="grid w-full gap-4 bg-stone-100 h-full overflow-y-auto">
           <main className="w-full h-full py-4 px-8 max-lg:px-4 max-md:px-2 grid bg-stone-100 overflow-y-auto">
            <TooltipProvider>{children}</TooltipProvider>
          </main>
          
        </div> */}

        {/* <main className="w-full h-full py-4 px-8 max-lg:px-4 grid bg-stone-100 overflow-y-auto">
          <TooltipProvider>{children}</TooltipProvider>
        </main> */}

        <TooltipProvider>{children}</TooltipProvider>

        <Toaster position="top-center" className="shadow-lg" />
      </body>
    </html>
  );
}
