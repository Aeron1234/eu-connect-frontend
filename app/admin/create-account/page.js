import CreateAccountForm from "@/app/_components/CreateAccountForm";
import ExistingAccounts from "@/app/_components/ExistingAccounts";
import PageContainer from "@/app/_components/PageContainer";
import PageTitle from "@/app/_components/PageTitle";
import {
  getAllAccounts,
  getCourses,
  getDepartments,
  getRoles,
} from "@/app/_services/services";
import { Spinner } from "@/components/ui/spinner";
import { UserPlus, Users } from "lucide-react";
import { Suspense } from "react";

async function CreateAccountPage({ searchParams }) {
  const [roles, courses, departments, allUserAccounts] = await Promise.all([
    getRoles(),
    getCourses(),
    getDepartments(),
    getAllAccounts(),
  ]);

  const params = await searchParams;

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2">
            <UserPlus className="w-7 h-7 text-primary-500" />
            Create Account
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Fill in the details to create a new user account
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow-sm flex-1 py-4 px-8 flex flex-col gap-4">
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
          <CreateAccountForm
            roles={roles || []}
            courses={courses || []}
            departments={departments || []}
          />
        </Suspense>
      </div>

      <div className="rounded-lg bg-white shadow-sm flex-1 py-4 px-8 gap-4 transition-all">
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
    </main>
  );
}

export default CreateAccountPage;
