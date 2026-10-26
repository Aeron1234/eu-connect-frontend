// Compatibility aliases for the shared See more reconciliation helpers.
// Posting callers retain their existing names while using the generic paging contract.
export {
  canKeepLoadedPages as canKeepLoadedPostingPages,
  reconcilePageOne as reconcilePostingPageOne,
  pageAfterRefresh as pageAfterPostingRefresh,
} from "./see-more-pagination.mjs";
