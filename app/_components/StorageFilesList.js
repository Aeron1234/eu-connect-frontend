"use client";

import { FolderOpen } from "lucide-react";
import StorageFilesTable from "./StorageFilesTable";
import StorageFilesTiles from "./StorageFilesTiles";
import StorageFilter from "./StorageFilter";
import StorageViewMode from "./StorageViewMode";
import { useMemo, useState } from "react";
import StorageSearchFile from "./StorageSearchFile";

function StorageFilesList({ params, internshipFiles }) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const viewedBy = params.view || "list";
  const filteredBy = params.filter || "all";

  const filteredFiles = useMemo(() => {
    let result = [...internshipFiles];

    if (query.trim()) {
      result = result.filter(
        (file) =>
          file.file_name.toLowerCase().includes(query.toLowerCase()) ||
          file.company_name.toLowerCase().includes(query.toLowerCase()),
      );
    } else if (query.trim() === "") {
      result = [...internshipFiles];
    }

    if (filteredBy === "before") {
      result = result.filter((file) => file.category === "before");
    } else if (filteredBy === "after") {
      result = result.filter((file) => file.category === "after");
    }

    if (filteredBy === "recent") {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    return result;
  }, [filteredBy, internshipFiles, query]);

  return (
    <>
      <div className="flex items-center justify-between h-fit max-[36rem]:flex-col-reverse max-sm:items-start max-[36rem]:gap-4 w-full max-[35.9rem]:mb-4">
        <StorageFilter
          params={params}
          setQuery={setQuery}
          setSearch={setSearch}
        />

        <div className="flex gap-2 items-center justify-end w-full max-w-75 max-[35.9rem]:max-w-full">
          <StorageSearchFile
            params={params}
            filteredFiles={filteredFiles}
            setQuery={setQuery}
            search={search}
            setSearch={setSearch}
          />

          <StorageViewMode viewedBy={viewedBy} filteredBy={filteredBy} />
        </div>
      </div>

      <h3 className="flex items-center gap-1 text-muted-foreground font-semibold">
        <span>
          <FolderOpen className="h-5 w-5 text-primary-emphasis" />
        </span>
        My Documents
      </h3>

      {viewedBy === "tiles" && (
        <StorageFilesTiles
          filteredFiles={filteredFiles}
          filteredBy={filteredBy}
        />
      )}

      {viewedBy === "list" && (
        <StorageFilesTable
          filteredFiles={filteredFiles}
          filteredBy={filteredBy}
        />
      )}
    </>
  );
}

export default StorageFilesList;
