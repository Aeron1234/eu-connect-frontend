import Header from "./_components/Header";
// import "./_styles/globals.css";
import "@/app/_styles/globals.css";
import { DM_Sans } from "next/font/google";

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
      <body
        className={`${DmSans.className} relative grid grid-rows-[auto_1fr] h-screen antialiased text-stone-800 overflow-x-hidden`}
      >
        <Header />

        <div className="flex-1 px-8 py-6 bg-stone-100 h-full">
          {/* <div className="grid grid-cols-[auto_1fr] max-lg:grid-cols-1 h-full gap-4 mx-auto max-w-7xl"> */}
          <div className="grid h-full gap-4 mx-auto max-w-7xl">
            <main className="h-full">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
