"use client";

import { useEffect, useRef, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { getAllAccounts } from "../_services/admin-actions";
import CreateAccountForm from "./CreateAccountForm";
import AccountFilterChips from "./AccountFilterChips";
import ExistingAccountList from "./ExistingAccountList";

const tabs = ["Form", "Accounts"];

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
  const [isPending, setIsPending] = useState(false);

  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);

  async function refreshList() {
    const newData = await getAllAccounts({ filter, search, page: 1 });
    if (newData?.error) {
      console.error(newData.error);
      return;
    }
    setAccounts(newData.accounts || []);
    setPage(1);
    setTotalPages(newData.totalPages || 1);
  }

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const thisRequestId = ++requestIdRef.current;

    const timeout = setTimeout(async () => {
      setIsPending(true);
      try {
        const newData = await getAllAccounts({ filter, search, page: 1 });

        if (thisRequestId !== requestIdRef.current) return;

        if (newData?.error) {
          console.error("Error loading accounts:", newData.error);
          setAccounts([]);
          setTotalPages(1);
          setPage(1);
          return;
        }

        setAccounts(newData.accounts || []);
        setPage(1);
        setTotalPages(newData.totalPages || 1);
      } catch (error) {
        if (thisRequestId === requestIdRef.current) {
          console.error("Error loading accounts:", error);
        }
      } finally {
        if (thisRequestId === requestIdRef.current) setIsPending(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [filter, search]);

  async function handleSeeMore() {
    if (isPending || page >= totalPages) return;
    setIsPending(true);
    const nextPage = page + 1;
    const thisRequestId = ++requestIdRef.current;

    try {
      const newData = await getAllAccounts({ filter, search, page: nextPage });

      if (thisRequestId !== requestIdRef.current) return;

      if (newData?.error) {
        console.error("Error loading more accounts:", newData.error);
        return;
      }

      setAccounts((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const filteredNew = (newData.accounts || []).filter(
          (a) => !existingIds.has(a.id),
        );
        return [...prev, ...filteredNew];
      });

      setPage(nextPage);
      if (newData?.totalPages) setTotalPages(newData.totalPages);
    } catch (error) {
      if (thisRequestId === requestIdRef.current) {
        console.error("Error loading more accounts:", error);
      }
    } finally {
      if (thisRequestId === requestIdRef.current) setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex rounded-lg bg-stone-200 p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t
                ? "bg-primary-500 text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-primary-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Form" ? (
        <div className="rounded-xl border border-stone-300 bg-white shadow-sm p-5 sm:p-6">
          <CreateAccountForm
            roles={roles}
            courses={courses}
            departments={departments}
            onCreated={refreshList}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              aria-label="Search accounts"
              className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary-200 sm:max-w-md"
            />
          </div>

          <AccountFilterChips
            roles={roles}
            value={filter}
            onChange={setFilter}
          />

          {accounts.length > 0 ? (
            <ExistingAccountList
              filteredAccounts={accounts}
              onActionSuccess={refreshList}
            />
          ) : (
            !isPending && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-white border-stone-300 py-16 text-center">
                <UserPlus className="size-8 text-stone-300" />
                <p className="text-sm text-stone-500">No accounts found.</p>
              </div>
            )
          )}

          {page < totalPages && (
            <button
              onClick={handleSeeMore}
              disabled={isPending}
              className="w-full text-center text-lg font-semibold text-stone-600 transition hover:text-primary-500 disabled:opacity-50"
            >
              {isPending ? "Loading..." : "See more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default AccountsManager;
