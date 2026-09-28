import SearchUsers from "../_components/SearchUsers";
import { getSearchHistory } from "@/lib/server-actions/history-actions";

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

      <SearchUsers historyData={searchedUserHistory?.history || []} />
    </main>
  );
}

export default UsersPage;
