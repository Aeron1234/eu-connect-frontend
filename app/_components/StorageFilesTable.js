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
import { formatDate } from "date-fns";
import {
  Download,
  File,
  FileBox,
  FileIcon,
  FileText,
  FileTextIcon,
  TableIcon,
  Trash2,
} from "lucide-react";
import Modal from "./Modal";
import StorageDeleteFile from "./StorageDeleteFile";

function StorageFilesTable({ filteredFiles = [] }) {
  return (
    <Table className={"rounded-md"}>
      {!filteredFiles.length && (
        <TableCaption>No uploaded files yet.</TableCaption>
      )}
      <TableHeader>
        <TableRow>
          <TableHead>File Name</TableHead>
          <TableHead className={"max-xs:hidden"}>Company Name</TableHead>
          <TableHead className={"max-sm:hidden"}>Category</TableHead>
          <TableHead className={"max-sm:hidden"}>Uploaded</TableHead>
          <TableHead className={"text-right"}></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredFiles.length > 0 &&
          filteredFiles.map((item) => (
            <TableRow className={`hover:bg-stone-50`} key={item.id}>
              <RowCells item={item} />
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

function RowCells({ item }) {
  const { id, created_at, file_name, company_name, category, url, file_type } =
    item;

  const formattedCategory =
    category[0].toUpperCase() + category.split("").slice(1).join("");

  const type = file_type?.toLowerCase() || "";

  const renderIcon = () => {
    if (type.includes("pdf"))
      return <FileText size={16} className="text-red-500" />;
    if (
      type.includes("sheet") ||
      type.includes("excel") ||
      type.includes("csv")
    )
      return <Table size={16} className="text-green-600" />;
    if (type.includes("word") || type.includes("officedocument"))
      return <FileBox size={16} className="text-blue-500" />;
    return <File size={16} className="text-stone-400" />;
  };

  return (
    <>
      <TableCell className={"flex gap-1 items-center"}>
        <span className="shrink-0">{renderIcon()}</span>
        <span className="truncate" title={file_name}>
          {file_name}
        </span>
      </TableCell>
      <TableCell className={"max-xs:hidden"}>{company_name}</TableCell>
      <TableCell className={"max-sm:hidden"}>{formattedCategory}</TableCell>
      <TableCell className={"max-sm:hidden"}>
        {formatDate(new Date(created_at), "MM/dd/yyyy")}
      </TableCell>
      <TableCell>
        <div className="text-stone-600 flex items-center gap-1 justify-end text-right">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 cursor-pointer hover:bg-stone-200 transition-colors rounded-sm"
          >
            <Download size={16} />
          </a>

          <Modal
            trigger={
              <span className="p-1 block cursor-pointer hover:bg-red-200 transition-colors rounded-sm">
                <Trash2 size={16} />
              </span>
            }
            title={<span className={`text-primary-500`}>Delete File</span>}
            // title={<span className="text-red-600">Clock-out?</span>}
            description={`Are you sure you want to delete this file?`}
          >
            <StorageDeleteFile fileId={id} fileUrl={url} />
          </Modal>
        </div>
      </TableCell>
    </>
  );
}

export default StorageFilesTable;
