import { Suspense } from "react";
import { getInbox } from "../_services/services";
import Logo from "./Logo";
import Navigation from "./Navigation";

async function Header() {
  const inboxData = await getInbox();

  return (
    <nav className="flex-1 flex items-center gap-4 z-50">
      <h1 className="font-semibold">
        Manuel S. Enverga University Foundation &mdash; Candelaria Inc.
      </h1>
      <Suspense fallback={<span></span>}>
        <Navigation inboxData={inboxData} />
      </Suspense>
    </nav>
  );
}

export default Header;
