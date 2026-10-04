import ErrorUI from "@/components/ui/ErrorUI";

/** Keep expected API errors visible in production Server Component pages. */
export function withReadErrorPage(Page) {
  return async function PageWithReadError(props) {
    try {
      return await Page(props);
    } catch (error) {
      const status = error?.status || (error?.message === "You must be logged in." ? 401 : 0);
      if ([401, 403, 429].includes(status)) {
        return (
          <ErrorUI
            error={{ status, message: error.message }}
            logError={false}
          />
        );
      }
      throw error;
    }
  };
}
