"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isEqual, parse } from "date-fns";

import Modal from "./Modal";
import { CircleX } from "lucide-react";
import DtrDeleteForm from "./DtrDeleteForm";
import Pagination from "./Pagination";
import { useWindowSize } from "../_services/helpers";
import DtrTableMini from "./DtrTableMini";

function DtrTable({ params, dtrData, currentDtrPage, currentNarrativePage }) {
  const { width } = useWindowSize();

  const dtrs = dtrData?.dtrs;
  const totalPages = dtrData?.totalPages;

  if (!dtrs) return <div>No daily time record found.</div>;

  const today = format(new Date(), "MM/dd/yyyy");

  if (currentDtrPage < 1) notFound();

  if (totalPages > 0 && currentDtrPage > totalPages) {
    notFound();
  }

  if (width < 670) {
    return <DtrTableMini dtrs={dtrs} />;
  }

  return (
    <>
      <div className="w-full overflow-x-scroll">
        <Table>
          {!dtrs.length && (
            <TableCaption>Clock-in to save a record of dtr</TableCaption>
          )}
          <TableHeader className={""}>
            <TableRow>
              <TableHead className="">Date</TableHead>
              <TableHead>In</TableHead>
              <TableHead>Location In</TableHead>
              <TableHead>Out</TableHead>
              <TableHead>Location Out</TableHead>
              <TableHead className="text-left">Total hours</TableHead>
              <TableHead className="w-fit"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dtrs
              ? dtrs.map((data) => (
                  <TableRow
                    key={data.id}
                    className={`${isEqual(today, format(data.created_at, "MM/dd/yyyy")) ? "bg-red-100 text-primary-500 hover:bg-red-200 border-b border-primary-200 " : "hover:bg-stone-50"} tracking-wide`}
                  >
                    <Row data={data} />
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      <div className="flex-1 flex h-full w-full justify-end items-end">
        <Pagination
          hrefPrev={`/student?d_page=${currentDtrPage - 1}&n_page=${currentNarrativePage}`}
          hrefNext={`/student?d_page=${currentDtrPage + 1}&n_page=${currentNarrativePage}`}
          currentPage={currentDtrPage}
          totalPages={totalPages}
        />
        {/* <span>See all</span> */}
      </div>
    </>
  );
}

function Row({ data }) {
  function parsedDate(date) {
    return parse(date, "HH:mm:ss", new Date());
  }

  function formattedLocation(location) {
    return location.length >= 50
      ? location.split(" ").slice(0, 4).join(" ") + "..."
      : location;
  }

  const {
    id,
    created_at,
    clock_in,
    clock_out,
    total_hours,
    location_in,
    location_out,
  } = data;

  return (
    <>
      <TableCell>
        {created_at && <span>{format(created_at, "MM/dd/yyyy")}</span>}
      </TableCell>
      <TableCell>
        {clock_in && <span>{format(parsedDate(clock_in), "h:mm a")}</span>}
      </TableCell>
      <TableCell className={"w-fit"}>
        {location_in && (
          <span className="tracking-wide text-wrap">
            {formattedLocation(location_in)}
          </span>
        )}
      </TableCell>
      <TableCell>
        {clock_out && <span>{format(parsedDate(clock_out), "h:mm a")}</span>}
      </TableCell>
      <TableCell>
        {location_out && (
          <span className="tracking-wide text-wrap">
            {formattedLocation(location_out)}
          </span>
        )}
      </TableCell>
      <TableCell className="text-left">
        {total_hours ? (
          total_hours.toFixed(2)
        ) : (
          <span className="text-primary-500 italic tracking-widest">
            Pending...
          </span>
        )}
      </TableCell>
      <TableCell className="flex justify-end items-center">
        <Modal
          trigger={
            <div className="w-fit rounded-full">
              <CircleX
                size={18}
                color="#78716C"
                // color="#EF4444"
                className="rounded-sm cursor-pointer"
                strokeWidth={2}
              />
            </div>
          }
          title={
            <span className={`text-primary-500`}>Delete Daily Time Record</span>
          }
          // title={<span className="text-red-600">Clock-out?</span>}
          description={`Are you sure you want to delete this daily time record?`}
        >
          <DtrDeleteForm dtrId={id} />
        </Modal>
      </TableCell>
    </>
  );
}

export default DtrTable;
