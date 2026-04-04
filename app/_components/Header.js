import Logo from "./Logo";
import Navigation from "./Navigation";

function Header() {
  return (
    <nav className="flex-1 flex justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <Logo />
        <h2 className="text-lg font-extrabold line-clamp-2 max-sm:text-base">
          EU · Connect
        </h2>
      </div>

      <Navigation />
    </nav>
  );
}

export default Header;
