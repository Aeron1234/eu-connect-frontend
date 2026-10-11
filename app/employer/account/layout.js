import Loading from "./loading";
import { Suspense } from "react";

function AccountLayout({ children }) {
  return (
    <Suspense
      fallback={
        <Loading />
      }
    >
      {children}
    </Suspense>
  );
}

export default AccountLayout;
