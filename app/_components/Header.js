import Logo from "./Logo";
import Navigation from "./Navigation";

function Header() {
  return (
    <header className="px-8 py-1 flex items-center w-full bg-white/50 backdrop-blur-sm text-stone-800 shadow-sm sticky top-0 h-16 z-10">
      <div className="flex-1 flex justify-between  max-w-7xl mx-auto items-center">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-extrabold line-clamp-2">
            EU-Connect
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
