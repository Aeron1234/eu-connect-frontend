"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, TriangleAlert, UserPlus } from "lucide-react";
import { getAllAccountsResult } from "@/lib/server-actions/account-actions";
import CreateAccountForm from "./CreateAccountForm";
import ExistingAccountList from "./ExistingAccountList";
import ExistingAccountListSkeleton from "../skeletons/ExistingAccountListSkeleton";
import SearchBar from "../ui/SearchBar";
import AccountDropdownFilter from "./AccountDropdownFilter";
import { hasValidPage } from "@/lib/see-more-pagination.mjs";

const tabs = ["Form", "Accounts"];

function requireAccountPage(result, expectedPage) {
  if (result?.error) {
    const error = new Error(result.error);
    error.status = result.status;
    throw error;
  }
  if (!hasValidPage(result, "accounts", null, expectedPage)) {
    throw new Error("Invalid accounts response from the server.");
  }
  return result;
}

function AccountsManager({
  roles = [],
  courses = [],
  departments = [],
  initialAccounts = [],
  initialTotalPages = 1,
}) {
  const [tab, setTab] = useState(tabs[0]);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [accounts, setAccounts] = useState(initialAccounts);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  // Split from `isLoadingMore` below — filter/search changes replace the
  // whole list (skeleton makes sense), while "See more" appends to what's
  // already visible (skeleton would wipe out a list the person can still
  // see and scroll, so that one just disables the button + swaps its text).
  const [isFiltering, setIsFiltering] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [listError, setListError] = useState(null);

  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);

  async function refreshList() {
    const thisRequestId = ++requestIdRef.current;
    setIsLoadingMore(false);
    setIsFiltering(true);
    setListError(null);
    try {
      const newData = requireAccountPage(await getAllAccountsResult({ filter, search, page: 1 }));
      if (thisRequestId !== requestIdRef.current) return;
      setAccounts(newData.accounts);
      setPage(1);
      setTotalPages(newData.totalPages || 1);
    } catch (error) {
      if (thisRequestId === requestIdRef.current) {
        setListError({ message: error?.message || "Couldn't load accounts. Please try again.", operation: "refresh", status: error?.status });
      }
    } finally {
      if (thisRequestId === requestIdRef.current) setIsFiltering(false);
    }
  }

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const thisRequestId = ++requestIdRef.current;
    setIsLoadingMore(false);
    setIsFiltering(true);
    setListError(null);

    const timeout = setTimeout(async () => {
      try {
        const newData = requireAccountPage(await getAllAccountsResult({ filter, search, page: 1 }));

        if (thisRequestId !== requestIdRef.current) return;

        setAccounts(newData.accounts);
        setPage(1);
        setTotalPages(newData.totalPages || 1);
      } catch (error) {
        if (thisRequestId === requestIdRef.current) {
          setListError({ message: error?.message || "Couldn't load accounts. Please try again.", operation: "refresh", status: error?.status });
        }
      } finally {
        if (thisRequestId === requestIdRef.current) setIsFiltering(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [filter, search]);

  async function handleSeeMore() {
    if (isFiltering || isLoadingMore || page >= totalPages) return;
    setIsLoadingMore(true);
    setListError(null);
    const nextPage = page + 1;
    const thisRequestId = ++requestIdRef.current;

    try {
      const newData = requireAccountPage(await getAllAccountsResult({ filter, search, page: nextPage }), nextPage);

      if (thisRequestId !== requestIdRef.current) return;

      setAccounts((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const filteredNew = newData.accounts.filter(
          (a) => !existingIds.has(a.id),
        );
        return [...prev, ...filteredNew];
      });

      setPage(nextPage);
      if (newData?.totalPages) setTotalPages(newData.totalPages);
    } catch (error) {
      if (thisRequestId === requestIdRef.current) {
        setListError({ message: error?.message || "Couldn't load more accounts. Please try again.", operation: "page", status: error?.status });
      }
    } finally {
      if (thisRequestId === requestIdRef.current) setIsLoadingMore(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex rounded-lg bg-secondary p-1 w-fit">
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
        <div className="rounded-xl border border-border bg-card shadow-sm p-5 sm:p-6">
          <CreateAccountForm
            roles={roles}
            courses={courses}
            departments={departments}
            onCreated={refreshList}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="relative">
              {/* <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /> */}
              <SearchBar
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

          {listError && (
            <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                <div>
                  <p className="font-semibold">{listError.status === 429 ? "Too many requests" : "Accounts could not be updated"}</p>
                  <p className="mt-1 text-foreground-soft">{listError.message}</p>
                  {accounts.length > 0 && <p className="mt-1 text-xs text-foreground-soft">Previously loaded accounts are still shown.</p>}
                </div>
              </div>
              <button type="button" onClick={listError.operation === "page" ? handleSeeMore : refreshList} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 font-semibold hover:bg-accent">
                <RefreshCw className="size-4" aria-hidden="true" /> Retry
              </button>
            </div>
          )}

          {isFiltering ? (
            <ExistingAccountListSkeleton rows={10} />
          ) : accounts.length > 0 ? (
            <ExistingAccountList
              filteredAccounts={accounts}
              onActionSuccess={refreshList}
            />
          ) : !listError ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-card border-border py-16 text-center">
              <UserPlus className="size-8 text-foreground-faint" />
              <p className="text-sm text-muted-foreground">
                No accounts found.
              </p>
            </div>
          ) : null}

          {!listError && page < totalPages && (
            <button
              onClick={handleSeeMore}
              disabled={isLoadingMore}
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
