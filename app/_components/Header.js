import Logo from "./Logo";
import Navigation from "./Navigation";

function Header() {
  return (
    <header className="px-8 py-4 bg-white text-stone-800 shadow-sm sticky top-0 max-h-23">
      <div className="flex justify-between max-w-7xl mx-auto items-center">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-base font-extrabold line-clamp-2">
            Manuel S. Enverga University Foundation, Candelaria Inc.
          </span>
        </div>

        <nav>
          <Navigation />
        </nav>
      </div>
    </header>
  );
}

export default Header;
