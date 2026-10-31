import "@/app/_styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DM_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/contexts/SidebarContext";
import QueryProvider from "@/lib/cache/QueryProvider";
import { PdfPreviewProvider } from "@/components/ui/PdfPreviewProvider";

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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="overflow-x-hidden scroll-smooth"
      suppressHydrationWarning
    >
      <body className={`${DmSans.className} `}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider><PdfPreviewProvider>{children}</PdfPreviewProvider></SidebarProvider>
            <Toaster position="top-center" className="shadow-lg" />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
