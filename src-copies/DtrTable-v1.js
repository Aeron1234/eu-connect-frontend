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
import { format, isEqual, parse, parseISO } from "date-fns";

import Modal from "./Modal";
import { CircleX } from "lucide-react";
import DtrDeleteForm from "./DtrDeleteForm";
import Pagination from "./Pagination";
import { useWindowSize } from "../_services/helpers";
import DtrTableMini from "./DtrTableMini";
import { usePathname } from "next/navigation";

function DtrTable({
  dtrs = [],
  totalPages = 1,
  currentDtrPage = 1,
  currentNarrativePage = 1,
  searchedUserId = "",
}) {
  const pathName = usePathname();
  const { width } = useWindowSize();
  const isStudentDashboard = pathName === "/student";

  const today = format(new Date(), "MM/dd/yyyy");

  if (currentDtrPage < 1) notFound();

  if (totalPages > 0 && currentDtrPage > totalPages) {
    notFound();
  }

  if (width < 670) {
    return <DtrTableMini dtrs={dtrs} />;
  }

  const hrefPrev = isStudentDashboard
    ? `/student?d_page=${currentDtrPage - 1}&n_page=${currentNarrativePage}`
    : `/users/${searchedUserId}?filter=dtr&d_page=${currentDtrPage - 1}`;

  const hrefNext = isStudentDashboard
    ? `/student?d_page=${currentDtrPage + 1}&n_page=${currentNarrativePage}`
    : `/users/${searchedUserId}?filter=dtr&d_page=${currentDtrPage + 1}`;

  return (
    <>
      <div className="w-full overflow-x-scroll">
        <Table>
          {!dtrs.length && (
            <TableCaption>
              {isStudentDashboard ? "Clock-in to save a record" : "No DTR yet."}
            </TableCaption>
          )}
          <TableHeader className={""}>
            <TableRow>
              <TableHead className="">Date</TableHead>
              <TableHead>In</TableHead>
              <TableHead>Out</TableHead>
              <TableHead className="text-left">Total hours</TableHead>
              <TableHead className="text-left">Status</TableHead>
              {isStudentDashboard && <TableHead className="w-fit"> </TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dtrs
              ? dtrs.map((data) => (
                  <TableRow
                    key={data.id}
                    className={`${isEqual(today, format(data.created_at, "MM/dd/yyyy")) ? "bg-red-100 text-primary-500 hover:bg-red-200 border-b border-primary-200 " : "hover:bg-stone-50"} tracking-wide`}
                  >
                    <Row data={data} isStudentDashboard={isStudentDashboard} />
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      <div className="flex-1 flex h-full w-full justify-end items-end">
        <Pagination
          hrefPrev={hrefPrev}
          hrefNext={hrefNext}
          currentPage={currentDtrPage}
          totalPages={totalPages}
        />
        {/* <span>See all</span> */}
      </div>
    </>
  );
}

function Row({ data, isStudentDashboard }) {
  const { id, created_at, clock_in, clock_out, total_hours, status } = data;

  return (
    <>
      <TableCell>
        {created_at && (
          <span>{format(parseISO(created_at), "MM/dd/yyyy")}</span>
        )}
      </TableCell>
      <TableCell>
        {clock_in && <span>{format(parseISO(clock_in), "h:mm a")}</span>}
      </TableCell>
      <TableCell>
        {clock_out ? (
          <span>{format(parseISO(clock_out), "h:mm a")}</span>
        ) : (
          <span>&mdash;</span>
        )}
      </TableCell>
      <TableCell className="text-left font-mono">
        {total_hours ? (
          total_hours.toFixed(2)
        ) : (
          <span className="text-primary-500 italic tracking-widest">
            Pending...
          </span>
        )}
      </TableCell>
      <TableCell className="text-left">
        {status ? (
          status
        ) : (
          <span className="text-primary-500 italic">Pending</span>
        )}
      </TableCell>
      {isStudentDashboard && (
        <TableCell className="flex justify-end items-center">
          <Modal
            trigger={
              <div className="w-fit rounded-full">
                <CircleX
                  color="#78716C"
                  // color="#EF4444"
                  className="rounded-sm cursor-pointer h-4 w-4"
                  strokeWidth={2}
                />
              </div>
            }
            title={
              <span className={`text-primary-500`}>
                Delete Daily Time Record
              </span>
            }
            // title={<span className="text-red-600">Clock-out?</span>}
            description={`Are you sure you want to delete this daily time record?`}
          >
            <DtrDeleteForm dtrId={id} />
          </Modal>
        </TableCell>
      )}
    </>
  );
}

export default DtrTable;
