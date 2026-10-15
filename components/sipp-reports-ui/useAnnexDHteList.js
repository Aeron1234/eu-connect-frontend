"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { notifyReadError } from "@/lib/client-read-error";
import { annexDHteInfiniteOptions, sippReportsKeys } from "@/lib/cache/sipp-reports-queries";
import { canKeepLoadedPages, hasValidPage } from "@/lib/see-more-pagination.mjs";

export default function useAnnexDHteList(initialPage) {
  const { user } = useUser();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(initialPage);
  const [year, setYear] = useState(initialPage?.academicYear || "");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ academicYear: initialPage?.academicYear || "", search: "" });

  useEffect(() => {
    const timeout = setTimeout(() => setFilters({ academicYear: year, search: query.trim() }), 500);
    return () => clearTimeout(timeout);
  }, [year, query]);

  const isChangingFilters = filters.academicYear !== year || filters.search !== query.trim();
  const companiesQuery = useInfiniteQuery({
    ...annexDHteInfiniteOptions(userId, filters),
    enabled: Boolean(userId),
    initialData:
      filters.academicYear === (initialPage?.academicYear || "") && !filters.search &&
      hasValidPage(initialPage, "companies")
        ? { pages: [initialPage], pageParams: [1] }
        : undefined,
  });
  const companies = useMemo(() => {
    const seen = new Set();
    return (companiesQuery.data?.pages || []).flatMap((page) =>
      page.companies.filter((company) => {
        if (seen.has(company.company_key)) return false;
        seen.add(company.company_key);
        return true;
      }),
    );
  }, [companiesQuery.data]);
  const total = companiesQuery.data?.pages[0]?.pagination.total || 0;
  const isPending = isChangingFilters || companiesQuery.isPending;

  function showCachedFilters(nextFilters) {
    if (userId && queryClient.getQueryData(sippReportsKeys.annexDList(userId, nextFilters))?.pages?.length) {
      setFilters(nextFilters);
    }
  }

  useEffect(() => {
    if (companiesQuery.error && companiesQuery.data) notifyReadError("Error loading HTE companies:", companiesQuery.error);
  }, [companiesQuery.error, companiesQuery.data]);

  useEffect(() => {
    if (!initialPage || serverSnapshotRef.current === initialPage || !userId) return;
    serverSnapshotRef.current = initialPage;
    const seedFilters = { academicYear: initialPage.academicYear || "", search: "" };
    queryClient.setQueryData(sippReportsKeys.annexDList(userId, seedFilters), (old) => {
      if (!old?.pages?.length) return { pages: [initialPage], pageParams: [1] };
      const previous = old.pages[0];
      const keepLoaded = canKeepLoadedPages(
        previous.companies.map((company) => company.company_key),
        previous.pagination.total,
        initialPage.companies,
        initialPage.pagination.total,
        (company) => company.company_key,
      );
      return {
        pages: keepLoaded ? [initialPage, ...old.pages.slice(1)] : [initialPage],
        pageParams: keepLoaded ? old.pageParams : [1],
      };
    });
  }, [initialPage, queryClient, userId]);

  function handleSeeMore() {
    if (!isPending && !companiesQuery.isFetching && companiesQuery.hasNextPage) {
      void companiesQuery.fetchNextPage();
    }
  }

  const totalInterns = companies.reduce((n, c) => n + (c.intern_count || 0), 0);

  return {
    companies, companiesQuery, isChangingFilters, isPending, handleSeeMore,
    filterProps: { query, setQuery, year, setYear, showCachedFilters },
    statsProps: { total, totalInterns, year },
  };
}
