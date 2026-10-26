// Retention heuristic for the same filtered query: unchanged total and first-page
// IDs/order allow keeping loaded pages. This does not verify unseen rows.
export function canKeepLoadedPages(
  previousKeys,
  previousTotal,
  nextPageOne,
  nextTotal,
  keyOf = (item) => item.id,
) {
  return (
    previousTotal === nextTotal &&
    previousKeys.length === nextPageOne.length &&
    previousKeys.every((key, index) => key === keyOf(nextPageOne[index]))
  );
}

// When retaining pages, refresh matching first-page rows in place; leave other
// loaded rows and their ordering intact. Otherwise replace the visible list.
export function reconcilePageOne(
  visibleItems,
  nextPageOne,
  keepLoadedPages,
  keyOf = (item) => item.id,
) {
  if (!keepLoadedPages) return nextPageOne;
  const freshByKey = new Map(nextPageOne.map((item) => [keyOf(item), item]));
  return visibleItems.map((item) => freshByKey.get(keyOf(item)) ?? item);
}

export function pageAfterRefresh(currentPage, keepLoadedPages) {
  return keepLoadedPages ? currentPage : 1;
}

// Check the minimum pagination contract, not every row field. Zero pages are valid;
// compare page numbers only when both the caller and response provide one.
export function hasValidPage(
  result,
  itemsField,
  paginationField = "pagination",
  expectedPage,
) {
  const pagination = paginationField ? result?.[paginationField] : result;
  const reportedPage = pagination?.page ?? pagination?.currentPage;
  return (
    Array.isArray(result?.[itemsField]) &&
    Number.isInteger(pagination?.totalPages) &&
    pagination.totalPages >= 0 &&
    (expectedPage === undefined ||
      reportedPage === undefined ||
      reportedPage === expectedPage)
  );
}
