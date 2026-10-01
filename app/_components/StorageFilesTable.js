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
import { Download, File, FileBox, FileText, Trash2 } from "lucide-react";
import Modal from "./Modal";
import StorageDeleteFile from "./StorageDeleteFile";
import { useTransition } from "react";
import { toastAndAction } from "../../lib/helpers";
import { Spinner } from "@/components/ui/spinner";
import { downloadInternshipFile } from "@/lib/server-actions/internship-docs-actions";

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
            <TableRow className={`hover:bg-muted/50`} key={item.id}>
              <RowCells item={item} />
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

function RowCells({ item }) {
  const {
    id,
    created_at,
    file_name,
    company_name,
    category,
    url,
    path,
    file_type,
  } = item;
  const [isPending, startTransition] = useTransition();
  const formattedCategory =
    category[0].toUpperCase() + category.split("").slice(1).join("");

  const type = file_type?.toLowerCase() || "";

  const renderIcon = () => {
    if (type.includes("pdf"))
      return <FileText className="text-red-500 h-5 w-5" />;
    if (
      type.includes("sheet") ||
      type.includes("excel") ||
      type.includes("csv")
    )
      return <Table className="text-green-600 h-5 w-5" />;
    if (type.includes("word") || type.includes("officedocument"))
      return <FileBox className="text-blue-500 h-5 w-5" />;
    return <File className="text-foreground-subtle h-5 w-5" />;
  };

  function handleDownload() {
    const formData = { fileId: id };
    const handlers = {
      loadingLabel: "Opening / downloading file...",
      successLabel: "File was opened / downloaded.",
      errorLabel: "Failed to open / download file.",
      action: downloadInternshipFile,
      formData,
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);

      if (!result?.success) return; // toastAndAction already showed the error toast

      window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

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
        <div className="text-foreground-soft flex items-center gap-1 justify-end text-right">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isPending}
            className="p-1 cursor-pointer hover:bg-secondary transition-colors rounded-sm disabled:opacity-50"
            aria-label="Download file"
          >
            {isPending ? (
              <Spinner className="h-5 w-5 stroke-3" />
            ) : (
              <Download className="h-5 w-5" />
            )}
          </button>

          <Modal
            trigger={
              <span className="p-1 block cursor-pointer hover:bg-red-200 transition-colors rounded-sm">
                <Trash2 className="h-5 w-5" />
              </span>
            }
            title={<span className={`text-primary-emphasis`}>Delete File</span>}
            // title={<span className="text-red-600">Clock-out?</span>}
            description={`Are you sure you want to delete this file?`}
          >
            <StorageDeleteFile fileId={id} fileUrl={url} path={path} />
          </Modal>
        </div>
      </TableCell>
    </>
  );
}

export default StorageFilesTable;
