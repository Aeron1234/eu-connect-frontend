import SearchUsers from "../_components/SearchUsers";
import { getSearchHistory } from "../_services/services";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import PageTitle from "../_components/PageTitle";

export const metadata = {
  title: "Users",
};

export const dynamic = "force-dynamic";

async function UsersPage() {
  const searchedUserHistory = await getSearchHistory({ type: "user" });

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <PageTitle
        title={"Search Users"}
        description={
          "Find Students, Employers/Supervisor, School Department heads or faculty."
        }
      />

      <Suspense
        fallback={
          <div className="self-center justify-self-center p-5">
            <span className="sr-only">Loading profile records...</span>
            <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
          </div>
        }
      >
        <SearchUsers historyData={searchedUserHistory?.history || []} />
      </Suspense>
    </main>
  );
}

export default UsersPage;
