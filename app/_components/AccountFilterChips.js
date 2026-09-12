// app/_components/AccountFilterChips.js
"use client";

function formatRoleName(roleName) {
  return roleName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

const statusOptions = ["active", "inactive", "suspended"];

function AccountFilterChips({ roles = [], value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          value === "all"
            ? "bg-primary-500 text-primary-foreground"
            : "bg-stone-200 text-muted-foreground hover:text-primary-500"
        }`}
      >
        All
      </button>

      {roles
        .filter((r) => r.role !== "admin")
        .map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onChange(r.role)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              value === r.role
                ? "bg-primary-500 text-primary-foreground"
                : "bg-stone-200 text-muted-foreground hover:text-primary-500"
            }`}
          >
            {formatRoleName(r.role)}
          </button>
        ))}

      {statusOptions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === s
              ? "bg-primary-500 text-primary-foreground"
              : "bg-stone-200 text-muted-foreground hover:text-primary-500"
          }`}
        >
          {formatRoleName(s)}
        </button>
      ))}
    </div>
  );
}

export default AccountFilterChips;
