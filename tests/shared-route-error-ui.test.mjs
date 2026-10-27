import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
const empty = () => null;
const childrenOnly = ({ children }) => children;
const noop = () => {};
const healthy = { isError: false, isPending: false, data: [] };

function query(data, nextPage = false) {
  const result = { data, isError: true, isPending: false, isFetchNextPageError: nextPage,
    error: Object.assign(new Error("fetch failed"), { status: 503 }), retries: 0, nextRetries: 0,
    refetch() { result.retries += 1; }, fetchNextPage() { result.nextRetries += 1; } };
  return result;
}

function fixture(file, mocks) {
  const errors = [];
  const replacements = {
    "@/components/ui/ErrorUI": (props) => { errors.push(props); return React.createElement("section", null, "Shared error screen"); },
    "@/contexts/UserContext": { useUser: () => ({ user: { id: "user-1", role: "employer" } }) },
    "@/components/ui/ConfirmDialog": empty, "../ui/TabBar": empty,
    "../ui/Modal": childrenOnly, "../ui/TitleButton": empty,
    "@/components/skeletons/ModalFormSkeleton": empty,
    "@/components/skeletons/RecordCardSkeleton": () => React.createElement("article", null, "Record skeleton"),
    "next/link": ({ href, children }) => React.createElement("a", { href }, children), ...mocks,
  };
  const url = new URL(`../components/${file}`, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), {
    filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]],
  });
  const compiledModule = { exports: {} };
  vm.runInNewContext(code, {
    module: compiledModule, exports: compiledModule.exports,
    require(id) { if (id.endsWith("/CompanyRotations")) return empty; if (id === "@/lib/hooks/useInternshipRotations") return () => ({ data: { enabled: false, rotations: [] } }); if (id === "@/components/help-ui/HelpManual") return empty; return Object.hasOwn(replacements, id) ? replacements[id] : require(id); },
  }, { filename: url.pathname });
  return { errors, render(props = {}) { errors.length = 0; return renderToStaticMarkup(React.createElement(compiledModule.exports.default, props)); } };
}

const feeds = [
  { file: "announcements-ui/AnnouncementBoard.js", marker: "Saved announcement", mocks: (result) => ({
    "../internship-records-ui/PostAnnouncementButton": empty, "../ui/PageTitle": empty, "../ui/PageManual": empty,
    "../skeletons/AnnouncementCardSkeleton": empty, "./SelectedAnnouncement": empty, "./AnnouncementBoardFilters": empty,
    "./AnnouncementGroups": () => "Saved announcement",
    "./useAnnouncementBoard": () => ({ categoriesQuery: healthy, announcementsQuery: result }),
  }) },
  { file: "internship-records-ui/RecordsPageContent.js", marker: "Saved record", mocks: (result) => ({
    "@/components/skeletons/InternshipRecordsPageSkeleton": empty, "./RecordsPageHeader": empty,
    "./RecordsPageFilter": empty, "./RecordListCard": () => "Saved record",
    "./useRecordsList": () => ({ recordsQuery: result, records: result.data ? [{ id: 1 }] : [] }),
  }) },
  { file: "internship-posts-ui/InternshipPosts.js", marker: "Saved post", mocks: (result) => ({
    "./InternshipPostsList": () => "Saved post", "../skeletons/InternshipPostsListSkeleton": empty,
    "./InternshipPostsFilters": empty,
    "./useInternshipPosts": () => ({ coursesQuery: healthy, postsQuery: result, internshipPosts: result.data ? [{ id: 1 }] : [] }),
  }) },
  { file: "notifications-ui/NotificationList.js", marker: "Saved notification", mocks: (result) => ({
    "@/components/skeletons/NotificationItemSkeleton": empty, "@/lib/notification-events": {},
    "./MarkAllAsReadButton": empty, "./NotificationItem": () => "Saved notification", "./NotificationInboxStats": empty,
    "./useNotificationInbox": () => ({ inboxQuery: result, notifications: result.data ? [{ id: 1 }] : [] }),
  }) },
];

for (const feed of feeds) {
  test(`${feed.file} retains loaded entries and retries the failed read or page`, () => {
    for (const state of ["initial", "refresh", "next"]) {
      const result = query(state === "initial" ? undefined : { pages: [] }, state === "next");
      const view = fixture(feed.file, feed.mocks(result));
      const html = view.render(); assert.equal(view.errors.length, 1);
      assert.equal(html.includes(feed.marker), state !== "initial");
      assert.equal(view.errors[0].error, result.error); view.errors[0].reset();
      assert.equal(result.nextRetries, state === "next" ? 1 : 0); assert.equal(result.retries, state === "next" ? 0 : 1);
    }
  });
}

test("past-internship errors preserve loaded companies and retry the failed read or page", () => {
  for (const state of ["initial", "refresh", "next"]) {
    const result = query(state === "initial" ? undefined : { pages: [{ data: [{ company_name: "Saved company" }] }] }, state === "next");
    const view = fixture("past-internship-ui/PastInternshipsPageContent.js", {
      "@tanstack/react-query": { useQuery: () => healthy, useInfiniteQuery: () => result, useQueryClient: () => ({}) },
      "@/lib/cache/reference-queries": { coursesOptions: () => ({}) }, "@/lib/see-more-pagination.mjs": {},
      "@/lib/cache/past-internships-queries": { pastInternshipsInfiniteOptions: () => ({}) }, "@/lib/client-read-error": {},
      "../ui/SearchBar": empty, "./AlumniCompanies": () => "Saved company", "../ui/AcademicYearFilter": empty, "../ui/DropdownFilter": empty,
      "../skeletons/AlumniCompaniesSkeleton": empty,
    });
    const html = view.render(); assert.equal(view.errors.length, 1);
    assert.equal(html.includes("Saved company"), state !== "initial"); assert.ok(!html.includes("No companies found"));
    view.errors[0].reset(); assert.equal(result.nextRetries, state === "next" ? 1 : 0); assert.equal(result.retries, state === "next" ? 0 : 1);
  }
});

const embeds = [
  { file: "calendar-ui/CalendarBoard.js", marker: "Saved calendar", mocks: (result) => ({
    "./useCalendarBoard": () => ({ monthQuery: result }), "./CalendarBoardHeader": empty,
    "./CalendarMonthView": () => "Saved calendar", "./CalendarAgenda": empty, "./CalendarOverview": empty, "./CalendarEditorDialog": empty,
  }) },
  { file: "map-ui/MapWrapper.js", marker: "Saved map", mocks: (result) => ({
    "./useMapLocationsView": () => ({ locationsQuery: result, blockingError: !result.data, tab: "Map View", sites: [{ id: 1 }] }),
    "./StudentMapHeader": empty, "./MapLocationsLoading": empty, "./MapLocationFilters": empty,
    "./CompanyMapView": () => "Saved map", "./CompanySiteCard": empty, "./CityVisitGroups": empty, "./MapViewerLocationControls": empty, "./MapVisitRecommendations": empty, "./MapPlanningTools": empty,
  }) },
  { file: "internship-records-ui/RecordsDetailsPageContent.js", marker: "Saved record tab", mocks: (result) => ({
    "./useRecordDetailsTabs": () => ({ tabQuery: result, data: result.data, loadError: !result.data, activeTab: "dtr" }),
    "../evaluations-ui/EvaluationCard": empty, "../internship-docs-ui/RecordsDocuments": empty,
    "../summary-reports-ui/RecordsSummaryReport": empty, "../skeletons/RecordsTabContentSkeleton": empty,
    "./RecordOverviewTab": empty, "./RecordDtrTab": () => "Saved record tab", "./RecordNarrativesTab": empty,
  }) },
  { file: "search-user-ui/SearchedUserRecordsManager.js", marker: "Saved profile tab", mocks: (result) => ({
    "./useSearchedUserTabs": () => ({ tabQuery: result, data: result.data, loadError: !result.data, activeTab: "dtr" }),
    "./SearchedUserFilter": empty, "../weekly-narratives-ui/StudentNarratives": empty,
    "../internship-docs-ui/EmployerCertificateUploads": empty, "./ProfileInfoGrid": empty,
    "../skeletons/TabContentSkeleton": empty, "./ProfileDtrTab": () => "Saved profile tab", "./ProfileEvaluationsTab": empty,
  }) },
];

for (const embed of embeds) {
  test(`${embed.file} shows ErrorUI and retains cached content after refresh failure`, () => {
    for (const data of [undefined, {}]) {
      const result = query(data), view = fixture(embed.file, embed.mocks(result));
      const html = view.render(); assert.equal(view.errors.length, 1);
      assert.equal(html.includes(embed.marker), Boolean(data));
      assert.equal(view.errors[0].error, result.error); view.errors[0].reset(); assert.equal(result.retries, 1);
    }
  });
}

test("post-creation modals use compact ErrorUI and retry their options without submitting", () => {
  for (const role of ["employer", "department_head"]) {
    const result = query(undefined);
    const file = role === "employer" ? "internship-posts-ui/InternshipPostButtonWrapper.js" : "past-internship-ui/PastInternshipPostButton.js";
    const view = fixture(file, {
      "@/contexts/UserContext": { useUser: () => ({ user: { id: "user-1", role, department_code: "CBA" } }) },
      "@tanstack/react-query": { useQuery: () => result, useQueryClient: () => ({}) },
      "@/lib/cache/reference-queries": { coursesOptions: () => ({}) }, "./InternshipPostButton": empty,
      "../ui/ManualDialog": empty, "./PastInternshipPostEditForm": empty,
      "@/lib/server-actions/past-internships-actions": {}, "@/lib/cache/past-internships-queries": {}, "../../lib/helpers": {},
    });
    view.render(); assert.equal(view.errors.length, 1); assert.equal(view.errors[0].compact, true);
    assert.equal(view.errors[0].error, result.error); view.errors[0].reset(); assert.equal(result.retries, 1);
  }
});

test("announcement modal preserves the category error status and retries only categories", () => {
  let retries = 0;
  const error = { status: 403, message: "Forbidden" };
  const view = fixture("internship-records-ui/PostAnnouncementButton.js", {
    "@/contexts/UserContext": { useUser: () => ({ user: { role: "admin" } }) },
    "../announcements-ui/AnnouncementForm": empty, "@/lib/server-actions/announcements-actions": {}, "../../lib/helpers": {},
  });
  view.render({ categoriesError: error, onRetryCategories: () => { retries += 1; } });
  assert.equal(view.errors[0].error, error); assert.equal(view.errors[0].compact, true);
  view.errors[0].reset(); assert.equal(retries, 1);
});

test("notification dropdown retains cached entries and retries navigation to the failed next page", () => {
  for (const state of ["initial", "refresh", "next"]) {
    const result = query(state === "initial" ? undefined : { pages: [] }, state === "next");
    const pageChanges = [];
    const view = fixture("notifications-ui/NotificationsDropdown.js", {
      "./NotificationDropdownSkeleton": empty, "./NotificationDropdownItem": () => "Saved notification", "./NotificationDropdownPagination": empty,
    });
    const html = view.render({ inboxQuery: result, inboxStatus: state === "initial" ? "error" : "ready",
      notifications: state === "initial" ? [] : [{ id: 1 }], page: 2, handlePageChange: (page) => pageChanges.push(page), unreadCount: 0 });
    assert.equal(view.errors.length, 1); assert.equal(html.includes("Saved notification"), state !== "initial");
    view.errors[0].reset(); assert.equal(result.retries, state === "next" ? 0 : 1);
    assert.deepEqual(pageChanges, state === "next" ? [3] : []);
  }
});

test("user search errors preserve cached history and current search results", () => {
  for (const searching of [false, true]) {
    const result = query([{ id: 1 }]);
    const view = fixture("search-user-ui/SearchUsers.js", {
      react: { ...React, useState: () => [searching ? "student" : "", noop] },
      "@tanstack/react-query": { useQuery: () => result, useQueryClient: () => ({}) },
      "@/lib/cache/search-users-queries": { searchHistoryOptions: () => ({}), searchUsersOptions: () => ({}) },
      "./HistoryLoadingCard": empty, "@/components/skeletons/UserCardSkeleton": empty,
      "./SearchedUsersHistoryList": () => "Saved history", "./UsersSearchBar": empty,
      "./SearchedUserEmpty": empty, "./SearchedUserList": () => "Saved users",
    });
    const html = view.render(); assert.equal(view.errors.length, 1);
    assert.ok(html.includes(searching ? "Saved users" : "Saved history"));
    view.errors[0].reset(); assert.equal(result.retries, 1);
  }
});

test("profile narratives distinguish initial errors from empty data and retry failed pages", () => {
  for (const state of ["initial", "refresh", "next"]) {
    const result = query(state === "initial" ? undefined : { pages: [{ narratives: [{ id: 1 }] }] }, state === "next");
    const view = fixture("weekly-narratives-ui/StudentNarratives.js", {
      "@tanstack/react-query": { useInfiniteQuery: () => result, useQueryClient: () => ({}) },
      "@/components/skeletons/WeeklyNarrativeListSkeleton": empty, "@/lib/see-more-pagination.mjs": {},
      "./WeeklyNarrativeCard": () => "Saved narrative",
      "@/lib/cache/user-profile-queries": { userProfileKeys: { narrativePages: () => [] }, userProfileNarrativesInfiniteOptions: () => ({}) },
    });
    const html = view.render(); assert.equal(view.errors.length, 1); assert.ok(!html.includes("No narratives submitted yet"));
    assert.equal(html.includes("Saved narrative"), state !== "initial"); view.errors[0].reset();
    assert.equal(result.nextRetries, state === "next" ? 1 : 0); assert.equal(result.retries, state === "next" ? 0 : 1);
  }
});


test("records tab/search transitions show card skeletons without removing filter controls", () => {
  let isSearching = true;
  const view = fixture("internship-records-ui/RecordsPageContent.js", {
    "@/components/skeletons/InternshipRecordsPageSkeleton": empty,
    "./RecordsPageHeader": () => "Records header",
    "./RecordsPageFilter": () => "Status tabs",
    "./RecordListCard": () => "Saved record",
    "./useRecordsList": () => ({ recordsQuery: { data: {}, isPending: false, isError: false }, records: [{ id: 1 }], isSearching }),
  });
  let html = view.render();
  assert.match(html, /Loading filtered internship records/);
  assert.equal((html.match(/Record skeleton/g) || []).length, 3);
  assert.match(html, /Status tabs/); assert.match(html, /Records header/);
  assert.doesNotMatch(html, /Saved record|No internship records match/);
  isSearching = false; html = view.render();
  assert.match(html, /Saved record/); assert.doesNotMatch(html, /Record skeleton/);
});


test("student profile rotation panel is limited to an explicitly authorized department head", () => {
  let count = 0;
  const view = fixture("search-user-ui/SearchedUserRecordsManager.js", {
    "./useSearchedUserTabs": () => ({ tabQuery: { data: {}, isError: false }, activeTab: "info", hideTabs: true }),
    "./SearchedUserFilter": empty, "../weekly-narratives-ui/StudentNarratives": empty,
    "../internship-docs-ui/EmployerCertificateUploads": empty, "./ProfileInfoGrid": () => "Basic info",
    "../skeletons/TabContentSkeleton": empty, "./ProfileDtrTab": empty, "./ProfileEvaluationsTab": empty,
  });
  // The shared fixture suppresses CompanyRotations, so its wrapper identifies mounting.
  for (const role of ["admin", "employer", "student", "department_head"]) {
    for (const allowed of [true, false, undefined]) {
      const html = view.render({ userRole: role, searchedUserRole: "student", canViewStudentRecords: allowed, info: { internship_id: "record" } });
      assert.match(html, /Basic info/);
      const expected = role === "department_head" && allowed === true;
      assert.equal(html.includes('class="mt-4"'), expected);
      if (expected) count++;
    }
  }
  assert.equal(count, 1);
});
