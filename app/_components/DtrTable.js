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
import { getDtrs } from "../_services/actions";
import Pagination from "./Pagination";

async function DtrTable({ params }) {
  const currentNarrativePage = Number(params.n_page) || 1;
  const currentDtrPage = Number(params.d_page) || 1;

  if (currentDtrPage < 1) notFound();

  const dtrData = await getDtrs(currentDtrPage);

  if (!dtrData) return <div>No daily time record found.</div>;

  const { dtrs, totalPages } = dtrData;

  if (totalPages > 0 && currentDtrPage > totalPages) {
    notFound();
  }

  const today = format(new Date(), "MM/dd/yyyy");

  return (
    <>
      <Table>
        {!dtrs.length && (
          <TableCaption>Clock-in to save a record of dtr</TableCaption>
        )}
        <TableHeader className={""}>
          <TableRow>
            <TableHead className="">Date</TableHead>
            <TableHead>In</TableHead>
            <TableHead>Out</TableHead>
            <TableHead className="text-left">Total hours</TableHead>
            <TableHead className="text-right"> </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dtrs &&
            dtrs.map((data) => (
              <TableRow
                key={data.id}
                className={`${isEqual(today, format(data.created_at, "MM/dd/yyyy")) ? "bg-primary-100 text-primary-500 hover:bg-primary-50 border-b border-primary-200 " : "hover:bg-stone-50"} `}
              >
                <Row data={data} />
              </TableRow>
            ))}
        </TableBody>
      </Table>
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
  const { id, created_at, clock_in, clock_out, total_hours } = data;

  function parsedDate(date) {
    return parse(date, "HH:mm:ss", new Date());
  }

  return (
    <>
      <TableCell>{format(created_at, "MM/dd/yyyy")}</TableCell>
      <TableCell>
        {clock_in && <span>{format(parsedDate(clock_in), "h:mm a")}</span>}
      </TableCell>
      <TableCell>
        {clock_out && <span>{format(parsedDate(clock_out), "h:mm a")}</span>}
      </TableCell>
      <TableCell className="text-left">
        {total_hours ? (
          total_hours.toFixed(2)
        ) : (
          <span className="text-primary-300">Pending...</span>
        )}
      </TableCell>
      <TableCell className="flex justify-end items-center">
        <Modal
          trigger={
            <div className="w-fit rounded-full bg-white">
              <CircleX
                size={18}
                color="#78716C"
                // color="#EF4444"
                className="rounded-sm cursor-pointer "
              />
            </div>
          }
          title={
            <span className={`text-red-600`}>Delete Daily Time Record</span>
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
