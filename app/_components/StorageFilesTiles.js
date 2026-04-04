"use client";

import FileCard from "./FileCard";

function StorageFilesTiles({ filteredFiles }) {
  if (filteredFiles.length === 0) return <p>No uploaded files yet.</p>;

  return (
    <ul className="grid grid-cols-6 max-2xl:grid-cols-5 max-xl:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2 gap-4 items-start font-normal text-xs">
      {filteredFiles &&
        filteredFiles.map((item) => (
          <li
            className="flex flex-col items-center bg-white rounded-md  transition-all p-4 shadow-sm hover:shadow-md max-md:p-2"
            key={item.id}
          >
            <FileCard item={item} />
          </li>
        ))}
    </ul>
  );
}

export default StorageFilesTiles;
