import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

function DtrTable() {
  return (
    <div className="max-h-65 h-full overflow-y-scroll">
      <Table>
        {/* <TableCaption>List of your Daily Time Records</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead className="">Date</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right"> </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={"text-sm max-lg:text-base max-md:text-sm"}>
          <TableRow>
            <TableCell className="font-medium">
              {format(new Date(), "MM/dd/yyyy")}
            </TableCell>
            <TableCell>{format(new Date(), "h:mm a")}</TableCell>
            <TableCell>In</TableCell>
            <TableCell className="text-right flex justify-end">
              <button className="">
                <Trash2
                  size={24}
                  className="bg-red-500 hover:bg-red-600 text-red-50 rounded-sm p-1 cursor-pointer"
                />
              </button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">
              {format(new Date(), "MM/dd/yyyy")}
            </TableCell>
            <TableCell>{format(new Date(), "h:mm a")}</TableCell>
            <TableCell>In</TableCell>
            <TableCell className="text-right flex justify-end">
              <button className="">
                <Trash2
                  size={24}
                  className="bg-red-500 hover:bg-red-600 text-red-50 rounded-sm p-1 cursor-pointer"
                />
              </button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">
              {format(new Date(), "MM/dd/yyyy")}
            </TableCell>
            <TableCell>{format(new Date(), "h:mm a")}</TableCell>
            <TableCell>In</TableCell>
            <TableCell className="text-right flex justify-end">
              <button className="">
                <Trash2
                  size={24}
                  className="bg-red-500 hover:bg-red-600 text-red-50 rounded-sm p-1 cursor-pointer"
                />
              </button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">
              {format(new Date(), "MM/dd/yyyy")}
            </TableCell>
            <TableCell>{format(new Date(), "h:mm a")}</TableCell>
            <TableCell>In</TableCell>
            <TableCell className="text-right flex justify-end">
              <button className="">
                <Trash2
                  size={24}
                  className="bg-red-500 hover:bg-red-600 text-red-50 rounded-sm p-1 cursor-pointer"
                />
              </button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">
              {format(new Date(), "MM/dd/yyyy")}
            </TableCell>
            <TableCell>{format(new Date(), "h:mm a")}</TableCell>
            <TableCell>In</TableCell>
            <TableCell className="text-right flex justify-end">
              <button className="">
                <Trash2
                  size={24}
                  className="bg-red-500 hover:bg-red-600 text-red-50 rounded-sm p-1 cursor-pointer"
                />
              </button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">
              {format(new Date(), "MM/dd/yyyy")}
            </TableCell>
            <TableCell>{format(new Date(), "h:mm a")}</TableCell>
            <TableCell>In</TableCell>
            <TableCell className="text-right flex justify-end">
              <button className="">
                <Trash2
                  size={24}
                  className="bg-red-500 hover:bg-red-600 text-red-50 rounded-sm p-1 cursor-pointer"
                />
              </button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

export default DtrTable;
