import { Suspense } from "react";
import CreateAccountLoading from "./loading";

function CreateAccountLayout({ children }) {
  return (
    <Suspense fallback={<CreateAccountLoading />}>
      {children}
    </Suspense>
  );
}

export default CreateAccountLayout;
