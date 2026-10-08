import { withReadErrorPage } from "@/lib/page-read-error";
import SearchUsers from "../../components/search-user-ui/SearchUsers";

import PageTitle from "../../components/ui/PageTitle";

export const metadata = {
  title: "Users",
};

export const dynamic = "force-dynamic";

function UsersPage() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <PageTitle
        title={"Search Users"}
        description={
          "Find Students, Employers/Supervisor, School Department heads or faculty."
        }
      />

      <SearchUsers />
    </main>
  );
}

export default withReadErrorPage(UsersPage);
