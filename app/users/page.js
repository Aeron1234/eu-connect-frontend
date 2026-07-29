import PageTitle from "../_components/PageTitle";
import PageContainer from "../_components/PageContainer";
import SearchUsers from "../_components/SearchUsers";
import { getSearchHistory } from "../_services/services";

export const metadata = {
  title: "Users",
};

async function UsersPage() {
  const searchedUserHistory = await getSearchHistory({ type: "user" });

  console.log(searchedUserHistory?.history);

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">
          Search Users
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Find Students, Employers/Supervisor, School Department heads or
          faculty
        </p>
      </div>

      <SearchUsers historyData={searchedUserHistory?.history || []} />
    </main>
  );
}

export default UsersPage;
