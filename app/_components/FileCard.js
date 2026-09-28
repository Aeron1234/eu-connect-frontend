"use client";

import { useTransition } from "react";
import { Download, File, FileBox, FileText, Table, Trash2 } from "lucide-react";
import Modal from "./Modal";
import StorageDeleteFile from "./StorageDeleteFile";
import { downloadInternshipFile } from "@/lib/server-actions/internship-docs-actions";
import { toastAndAction } from "../../lib/helpers"; // or wherever it lives
import { Spinner } from "@/components/ui/spinner";

function FileCard({ item }) {
  const { id, file_name, company_name, file_type } = item;
  const [isPending, startTransition] = useTransition();

  const type = file_type?.toLowerCase() || "";

  const renderIcon = () => {
    if (type.includes("pdf"))
      return <FileText size={24} className="text-red-500" />;
    if (
      type.includes("sheet") ||
      type.includes("excel") ||
      type.includes("csv")
    )
      return <Table size={24} className="text-green-600" />;
    if (type.includes("word") || type.includes("officedocument"))
      return <FileBox size={24} className="text-blue-500" />;
    return <File size={24} className="text-stone-400" />;
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
      <div className="w-fit flex justify-center rounded-md text-stone-600 mb-2 p-2 bg-stone-100">
        <span className="shrink-0">{renderIcon()}</span>
      </div>
      <div className="flex-1 flex flex-col gap-2 rounded-b-md wrap-break-word items-center mt-2">
        <div className="flex flex-col items-center flex-1 w-full">
          <span className="text-stone-500">File Name</span>
          <p>{file_name}</p>
        </div>

        <div className="flex flex-col items-center flex-1 w-full max-xs:hidden">
          <span className="text-stone-500">Company Name</span>
          <p>{company_name}</p>
        </div>

        <div className="w-full text-stone-600 flex items-center gap-1 justify-center text-right mt-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isPending}
            className="p-1 cursor-pointer hover:bg-stone-200 transition-colors rounded-sm disabled:opacity-50"
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
            title={<span className="text-primary-500">Delete File</span>}
            description="Are you sure you want to delete this file?"
          >
            <StorageDeleteFile fileId={id} />
          </Modal>
        </div>
      </div>
    </>
  );
}

export default FileCard;
