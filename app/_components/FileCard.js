import { Download, File, FileBox, FileText, Table, Trash2 } from "lucide-react";
import Modal from "./Modal";
import StorageDeleteFile from "./StorageDeleteFile";

function FileCard({ item }) {
  const { id, created_at, file_name, company_name, category, url, file_type } =
    item;

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
            <StorageDeleteFile fileId={id} />
          </Modal>
        </div>
      </div>
    </>
  );
}

export default FileCard;
