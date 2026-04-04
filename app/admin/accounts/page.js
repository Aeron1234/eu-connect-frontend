import CreateAccountForm from "@/app/_components/CreateAccountForm";
import ExistingAccounts from "@/app/_components/ExistingAccounts";
import PageContainer from "@/app/_components/PageContainer";
import PageTitle from "@/app/_components/PageTitle";
import { getAllAccounts, getCourses, getRoles } from "@/app/_services/services";
import { Spinner } from "@/components/ui/spinner";
import { UserPlus, Users } from "lucide-react";
import { Suspense } from "react";

async function AccountsPage({ searchParams }) {
  const [roles, courses, allUserAccounts] = await Promise.all([
    getRoles(),

    getCourses(),
    getAllAccounts(),
  ]);

  const params = await searchParams;

  return (
    <PageContainer>
      <PageTitle
        title={"Manage Accounts"}
        icon={<Users className="h-5 w-5" />}
        description="Create and manage accounts for students, department heads, and employers"
      />

      <section className="rounded-sm bg-white shadow-sm flex-1 py-4 px-8 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2 mb-1">
            <span>
              <UserPlus className="h-5 w-5" />
            </span>
            Create Account
          </h2>
          <p className="text-sm text-stone-600">
            Fill in the details to create a new user account
          </p>
        </div>

        <Suspense
          fallback={
            <div className="self-center justify-self-center p-5">
              <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
            </div>
          }
        >
          <CreateAccountForm roles={roles} courses={courses} />
        </Suspense>
      </section>
      <div className="rounded-sm bg-white shadow-sm flex-1 py-4 px-8 gap-4 transition-all">
        <Suspense
          fallback={
            <div className="self-center justify-self-center p-5">
              <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
            </div>
          }
        >
          <ExistingAccounts
            roles={roles}
            allUserAccounts={allUserAccounts}
            params={params}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
}

export default AccountsPage;
