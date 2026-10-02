import Navigation from "./Navigation";

function Header() {
  return (
    <nav className="flex-1 flex items-center gap-4 z-50">
      <h1 className="hidden lg:block font-semibold">
        Manuel S. Enverga University Foundation &mdash; Candelaria Inc.
      </h1>

      <Navigation />
    </nav>
  );
}

export default Header;
