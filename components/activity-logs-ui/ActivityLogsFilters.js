import SearchBar from "../ui/SearchBar";
import DropdownFilter from "../ui/DropdownFilter";

export default function ActivityLogsFilters({
  query,
  setQuery,
  actorRole,
  setActorRole,
  targetType,
  setTargetType,
  actorRoleOptions,
  targetTypeOptions,
  showCachedFilters,
}) {
  return (
    <div className="flex gap-2 flex-col sm:flex-row">
      <div className="items-start">
        <SearchBar
          value={query}
          onChange={(e) => {
            const search = e.target.value;
            setQuery(search);
            showCachedFilters({ actorRole, targetType, search: search.trim() });
          }}
          placeholder="Search by description..."
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <DropdownFilter
          value={actorRole}
          onValueChange={(nextRole) => {
            setActorRole(nextRole);
            showCachedFilters({ actorRole: nextRole, targetType, search: query.trim() });
          }}
          options={actorRoleOptions}
          placeholder="Role"
          className="bg-card p-2 flex-1 sm:flex-0 rounded-md"
        />
        <DropdownFilter
          value={targetType}
          onValueChange={(nextType) => {
            setTargetType(nextType);
            showCachedFilters({ actorRole, targetType: nextType, search: query.trim() });
          }}
          options={targetTypeOptions}
          placeholder="Module"
          className="bg-card p-2 flex-1 sm:flex-0 rounded-md"
        />
      </div>
    </div>
  );
}
