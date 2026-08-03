import "@/app/_styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
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
      <body className={`${DmSans.className} `}>
        {children}

        <Toaster position="top-center" className="shadow-lg" />
      </body>
    </html>
  );
}
