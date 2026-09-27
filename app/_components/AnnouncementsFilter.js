"use client";

import { useUser } from "@/contexts/UserContext";
import { cx } from "@/lib/utils";

function AnnouncementsFilter({ categories, category, setCategory }) {
  const { user } = useUser();

  const userRole = user.role;

  if (!["student", "department_head", "admin"].includes(userRole)) return null;

  if (!categories || categories.length === 0) return null;

  return (
    <ul className="flex items-center gap-1 font-medium">
      <li>
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={cx(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            category === "all"
              ? "text-white bg-primary-500"
              : "hover:bg-stone-200",
          )}
        >
          All
        </button>
      </li>
      {categories.length > 0
        ? categories.map((cat) => {
            const value = cat.name.toLowerCase();
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => setCategory(value)}
                  className={cx(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    category === value
                      ? "text-white bg-primary-500"
                      : "hover:bg-stone-200",
                  )}
                >
                  {cat.name}
                </button>
              </li>
            );
          })
        : null}
    </ul>
  );
}

export default AnnouncementsFilter;
