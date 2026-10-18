"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, TriangleAlert, UserPlus } from "lucide-react";
import ErrorUI from "@/components/ui/ErrorUI";
import { useUser } from "@/contexts/UserContext";
import { accountsInfiniteOptions, accountsKeys } from "@/lib/cache/accounts-queries";
import { accountFormOptions } from "@/lib/cache/account-form-queries";
import { canKeepLoadedPages } from "@/lib/see-more-pagination.mjs";
import CreateAccountForm from "./CreateAccountForm";
import ExistingAccountList from "./ExistingAccountList";
import ExistingAccountListSkeleton from "../skeletons/ExistingAccountListSkeleton";
import CreateAccountFormSkeleton from "../skeletons/CreateAccountFormSkeleton";
import SearchBar from "../ui/SearchBar";
import AccountDropdownFilter from "./AccountDropdownFilter";

const tabs = ["Form", "Accounts"];
const defaultFilters = { filter: "all", search: "" };

function AccountsManager({ initialPage }) {
  const { user } = useUser();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const formQuery = useQuery({
    ...accountFormOptions(userId),
    enabled: Boolean(userId),
  });
  const roles = formQuery.data?.roles || [];
  const courses = formQuery.data?.courses || [];
  const departments = formQuery.data?.departments || [];
  const serverSnapshotRef = useRef(initialPage);
  const [tab, setTab] = useState(tabs[0]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedFilters, setDebouncedFilters] = useState(defaultFilters);

  useEffect(() => {
    const nextFilters = { filter, search: search.trim() };
    const timer = setTimeout(() => setDebouncedFilters(nextFilters), 500);
    return () => clearTimeout(timer);
  }, [filter, search]);

  const isChangingFilters =
    debouncedFilters.filter !== filter ||
    debouncedFilters.search !== search.trim();
  const accountsQuery = useInfiniteQuery({
    ...accountsInfiniteOptions(userId, debouncedFilters),
    enabled: Boolean(userId) && tab === "Accounts",
    initialData:
      debouncedFilters.filter === "all" && !debouncedFilters.search && initialPage
        ? { pages: [initialPage], pageParams: [1] }
        : undefined,
  });
  const accounts = useMemo(() => {
    const seen = new Set();
    return (accountsQuery.data?.pages || []).flatMap((page) =>
      page.accounts.filter((account) => {
        if (seen.has(account.id)) return false;
        seen.add(account.id);
        return true;
      }),
    );
  }, [accountsQuery.data]);
  const isFiltering = isChangingFilters || accountsQuery.isPending;
  const isLoadingMore = accountsQuery.isFetchingNextPage;
  const listError = !isChangingFilters && accountsQuery.error
    ? {
        message: accountsQuery.error.message || "Couldn't load accounts. Please try again.",
        status: accountsQuery.error.status,
        operation: accountsQuery.isFetchNextPageError ? "page" : "refresh",
      }
    : null;

  // revalidatePath can send an updated first page without remounting this manager.
  useEffect(() => {
    if (!initialPage || serverSnapshotRef.current === initialPage || !userId) return;
    serverSnapshotRef.current = initialPage;
    queryClient.setQueryData(accountsKeys.list(userId, defaultFilters), (old) => {
      if (!old?.pages?.length) return { pages: [initialPage], pageParams: [1] };
      const previous = old.pages[0];
      const keepLoaded = canKeepLoadedPages(
        previous.accounts.map((account) => account.id),
        previous.totalRecords,
        initialPage.accounts,
        initialPage.totalRecords,
      );
      return {
        pages: keepLoaded ? [initialPage, ...old.pages.slice(1)] : [initialPage],
        pageParams: keepLoaded ? old.pageParams : [1],
      };
    });
  }, [initialPage, queryClient, userId]);

  function refreshList() {
    // Creating or changing an account can shift every later offset page.
    queryClient.setQueriesData({ queryKey: accountsKeys.all(userId) }, (old) =>
      old?.pages?.length
        ? { pages: [old.pages[0]], pageParams: [1] }
        : old,
    );
    void queryClient.invalidateQueries({ queryKey: accountsKeys.all(userId) });
  }

  function handleSeeMore() {
    if (!isFiltering && !accountsQuery.isFetching && accountsQuery.hasNextPage) {
      void accountsQuery.fetchNextPage();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex w-fit rounded-lg bg-secondary p-1">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-primary-emphasis"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Form" ? (
        <div>
          {formQuery.isPending ? (
            <CreateAccountFormSkeleton />
          ) : formQuery.isError && !formQuery.data ? (
            <ErrorUI error={formQuery.error} reset={() => void formQuery.refetch()} logError={false} />
          ) : <CreateAccountForm
            roles={roles}
            courses={courses}
            departments={departments}
            onCreated={refreshList}
          />}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <SearchBar
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email..."
                aria-label="Search accounts"
                className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary-200 sm:max-w-md"
              />
            </div>
            <AccountDropdownFilter
              roles={roles}
              value={filter}
              onChange={setFilter}
            />
          </div>

          {listError && accountsQuery.data && (
            <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                <div>
                  <p className="font-semibold">
                    {listError.status === 429 ? "Too many requests" : "Accounts could not be updated"}
                  </p>
                  <p className="mt-1 text-foreground-soft">{listError.message}</p>
                  {accounts.length > 0 && (
                    <p className="mt-1 text-xs text-foreground-soft">Previously loaded accounts are still shown.</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (listError.operation === "page") {
                    void accountsQuery.fetchNextPage();
                  } else {
                    void accountsQuery.refetch();
                  }
                }}
                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 font-semibold hover:bg-accent"
              >
                <RefreshCw className="size-4" aria-hidden="true" /> Retry
              </button>
            </div>
          )}

          {isFiltering ? (
            <ExistingAccountListSkeleton rows={10} />
          ) : listError && !accountsQuery.data ? (
            <ErrorUI error={accountsQuery.error} reset={() => void accountsQuery.refetch()} logError={false} />
          ) : accounts.length > 0 ? (
            <ExistingAccountList
              filteredAccounts={accounts}
              onActionSuccess={refreshList}
            />
          ) : !listError ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <UserPlus className="size-8 text-foreground-faint" />
              <p className="text-sm text-muted-foreground">No accounts found.</p>
            </div>
          ) : null}

          {!listError && accountsQuery.hasNextPage && (
            <button
              type="button"
              onClick={handleSeeMore}
              disabled={accountsQuery.isFetching || isFiltering}
              className="w-full text-center text-lg font-semibold text-foreground-soft transition hover:text-primary-emphasis disabled:opacity-50"
            >
              {isLoadingMore ? "Loading..." : "See more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default AccountsManager;
