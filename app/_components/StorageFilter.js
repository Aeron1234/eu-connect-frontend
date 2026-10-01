import Link from "next/link";

function StorageFilter({ params, setQuery, setSearch }) {
  const filterParams = params.filter || "all";
  const viewParams = params.view || "list";
  // const companyParams = params.company || "all";

  const filter = [
    {
      href: `/student/storage?filter=all&view=${viewParams}`,
      value: "all",
      text: "All",
    },
    {
      href: `/student/storage?filter=before&view=${viewParams}`,
      value: "before",
      text: "Before",
    },
    {
      href: `/student/storage?filter=after&view=${viewParams}`,
      value: "after",
      text: "After",
    },
    {
      href: `/student/storage?filter=recent&view=${viewParams}`,
      value: "recent",
      text: "Most Recent",
    },
  ];

  function handleClear(filterValue) {
    if (filterValue !== "all") return;

    setQuery("");
    setSearch("");
  }

  return (
    <ul className="flex items-center h-full gap-1 font-semibold max-sm:font-normal max-sm:gap-0.5 ">
      {filter.map((value) => (
        <li key={value.href} onClick={() => handleClear(value.value)}>
          <FilterButton value={value} filterParams={filterParams} />
        </li>
      ))}
    </ul>
  );
}

function FilterButton({ value, filterParams }) {
  const active = filterParams === value.value;

  return (
    <Link
      href={value.href}
      className={`${active ? "bg-primary text-white" : "hover:bg-secondary"} px-4 py-2 rounded-sm transition-colors max-md:p-2`}
    >
      {value.text}
    </Link>
  );
}

export default StorageFilter;
