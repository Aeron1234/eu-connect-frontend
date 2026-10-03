import AccountCardSkeleton from "./AccountCardSkeleton";

function ExistingAccountListSkeleton({ rows = 5 }) {
  return (
    <ul className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i}>
          <AccountCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

export default ExistingAccountListSkeleton;
