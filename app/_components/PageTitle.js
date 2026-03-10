async function PageTitle({ children = null, title, name = "" }) {
  return (
    <header className="px-4 py-3 flex items-center justify-between gap-4 bg-white shadow-sm rounded-md">
      <h1 className="text-lg font-bold text-stone-800">
        {title} <span>{name}</span>!
      </h1>

      {children}
    </header>
  );
}

export default PageTitle;
