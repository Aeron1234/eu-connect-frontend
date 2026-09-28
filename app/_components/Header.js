import { getInbox } from "@/lib/server-actions/notifications-actions";
import Navigation from "./Navigation";

async function Header() {
  const inboxData = await getInbox();

  return (
    <nav className="flex-1 flex items-center gap-4 z-50">
      <h1 className="hidden lg:block font-semibold">
        Manuel S. Enverga University Foundation &mdash; Candelaria Inc.
      </h1>

      <Navigation inboxData={inboxData || {}} />
    </nav>
  );
}

export default Header;
