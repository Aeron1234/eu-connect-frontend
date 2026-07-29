import AccountStudent from "@/app/_components/AccountStudent";
import AccountEmployer from "@/app/_components/AccountEmployer";
import { redirect } from "next/navigation";
import { getUserProfile, getUserSession } from "../_services/services";
import AccountDepartmentHead from "@/app/_components/AccountDepartmentHead";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import AccountAdmin from "@/app/_components/AccountAdmin";

export const metadata = {
  title: "Account",
};

async function AccountPage() {
  const session = await getUserSession();
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  if (role === "student") {
    const userProfile = await getUserProfile();

    return (
      <Suspense
        fallback={
          <div className="self-center justify-self-center p-5">
            <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
          </div>
        }
      >
        <AccountStudent userProfile={userProfile} />
      </Suspense>
    );
  }

  if (role === "department_head") return <AccountDepartmentHead />;

  if (role === "employer") return <AccountEmployer />;

  if (role === "admin") return <AccountAdmin />;
}

export default AccountPage;
