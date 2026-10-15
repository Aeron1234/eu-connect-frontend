import AnnouncementsFilter from "./AnnouncementsFilter";
import SearchBar from "../ui/SearchBar";

export default function AnnouncementBoardFilters({
  search,
  handleSearchChange,
  categories,
  category,
  handleCategoryChange,
}) {
  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-start">
      <SearchBar
        value={search}
        onChange={handleSearchChange}
        placeholder="Search announcements..."
        ariaLabel="Search announcements"
        position="right"
      />

      <AnnouncementsFilter
        categories={categories || []}
        category={category}
        setCategory={handleCategoryChange}
      />
    </div>
  );
}
