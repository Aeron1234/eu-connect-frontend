function PageTitle({ children = null, title }) {
  return (
    <header className="px-4 py-3 flex items-center justify-between gap-4 bg-white shadow-sm rounded-md">
      <h1 className="text-xl font-bold text-stone-800">{title}</h1>

      {children}
    </header>
  );
}

export default PageTitle;
