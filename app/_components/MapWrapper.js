"use client";

import dynamic from "next/dynamic";
import MapSearch from "./MapSearch";
import MapFilter from "./MapFilter";
import { useMemo, useState } from "react";

const Map = dynamic(() => import("app/_components/Map"), {
  ssr: false,
});

const CANDELARIA_COORDS = [13.92857, 121.4244509];

function MapWrapper({ activeInternships, params }) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");

  const filteredBy = params?.filter || "all";

  const { result, coords } = useMemo(() => {
    let result = [...activeInternships];
    let coords = CANDELARIA_COORDS;

    if (filteredBy !== "all") {
      result = activeInternships.filter((internship) =>
        internship.state_or_province
          .toLowerCase()
          .includes(filteredBy.toLowerCase()),
      );
      console.log(result);

      if (result.length > 0) {
        coords =
          [parseFloat(result[0].lat), parseFloat(result[0].lon)] ||
          CANDELARIA_COORDS;
      }
    } else if (filteredBy === "all") {
      result = [...activeInternships];
    }

    if (query.trim()) {
      result = activeInternships.filter(
        (internship) =>
          internship.first_name.toLowerCase().includes(query.toLowerCase()) ||
          internship.last_name.toLowerCase().includes(query.toLowerCase()) ||
          internship.course_name.toLowerCase().includes(query.toLowerCase()) ||
          internship.company_name.toLowerCase().includes(query.toLowerCase()),
      );

      if (result.length > 0) {
        coords =
          [parseFloat(result[0].lat), parseFloat(result[0].lon)] ||
          CANDELARIA_COORDS;
      }
    } else if (!query.trim()) {
      result = [...activeInternships];
    }

    return { result, coords };
  }, [filteredBy, activeInternships, query]);

  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="flex gap-2 items-center mb-2">
        <MapSearch
          setQuery={setQuery}
          query={query}
          search={search}
          setSearch={setSearch}
          // activeInternships={internshipsData}
          // setInternshipsData={setInternshipsData}
        />
        <MapFilter
          activeInternships={activeInternships}
          filteredBy={filteredBy}
          query={query}
          setQuery={setQuery}
          search={search}
          setSearch={setSearch}
        />
      </div>
      <Map result={result} coords={coords} filteredBy={filteredBy} />
    </div>
  );
}

export default MapWrapper;
