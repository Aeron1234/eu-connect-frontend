import AccountStudent from "@/app/_components/AccountStudent";
import AccountAdmin from "@/app/_components/AccountAdmin";
import AccountEmployer from "@/app/_components/AccountEmployer";
import AccountSuperAdmin from "@/app/_components/AccountSuperAdmin";
import { auth } from "@/app/_services/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Account",
};

async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  if (role === "student") return <AccountStudent />;

  if (role === "admin") return <AccountAdmin />;

  if (role === "employer") return <AccountEmployer />;

  if (role === "superAdmin") return <AccountSuperAdmin />;
}

export default AccountPage;
