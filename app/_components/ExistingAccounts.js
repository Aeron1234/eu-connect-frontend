"use client";

import { useMemo, useState } from "react";
import ExistingAccountFilter from "./ExistingAccountFilter";
import ExistingAccountList from "./ExistingAccountList";
import SearchExistingAccount from "./SearchExistingAccount";

function ExistingAccounts({ roles, allUserAccounts, params }) {
  const filteredBy = params.filter || "all";

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");

  const filteredAccounts = useMemo(() => {
    let result = [...allUserAccounts];

    if (filteredBy !== "all") {
      result = allUserAccounts.filter(
        (account) =>
          account.role === filteredBy || account.status === filteredBy,
      );
    } else if (filteredBy === "all") {
      result = [...allUserAccounts];
    }

    if (query) {
      result = allUserAccounts.filter(
        (accout) =>
          accout.first_name.toLowerCase().includes(query) ||
          accout.last_name.toLowerCase().includes(query),
      );
    }

    return result;
  }, [allUserAccounts, filteredBy, query]);

  return (
    <>
      <div className="flex gap-2 justify-between items-center">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            Existing Account
          </h2>
          <p className="text-sm text-stone-600">5 total accounts</p>
        </div>

        <div className="flex gap-2 py-1">
          <SearchExistingAccount
            search={search}
            setSearch={setSearch}
            setQuery={setQuery}
          />

          <ExistingAccountFilter roles={roles} />
        </div>
      </div>

      <ExistingAccountList
        filteredAccounts={filteredAccounts}
        filteredBy={filteredBy}
      />
    </>
  );
}

export default ExistingAccounts;
