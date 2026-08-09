import SearchUsers from "../_components/SearchUsers";
import { getSearchHistory, getUserSession } from "../_services/services";

export const metadata = {
  title: "Users",
};

async function UsersPage() {
  const [session, searchedUserHistory] = await Promise.all([
    getUserSession(),
    getSearchHistory({ type: "user" }),
  ]);

  const userId = session?.user?.id;
  const userRole = session?.user?.role;

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

      <SearchUsers
        historyData={searchedUserHistory?.history || []}
        userId={userId}
        userRole={userRole}
      />
    </main>
  );
}

export default UsersPage;
