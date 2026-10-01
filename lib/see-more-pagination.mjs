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
