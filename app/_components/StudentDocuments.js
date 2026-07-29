import { format } from "date-fns";
import { Download, FileText } from "lucide-react";

function StudentDocuments() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <h3 className="flex items-center gap-1 text-base font-medium mb-2">
          <FileText className="h-5 w-5" /> Before
        </h3>
        <ul className="flex flex-col mb-4 gap-2">
          <li className="flex gap-2 justify-between items-center p-4 border border-stone-300 rounded-sm">
            <div className="flex items-center gap-4">
              <span className="rounded-md bg-red-100 h-12 w-12 text-red-600 font-semibold flex items-center justify-center">
                PDF
              </span>

              <div className="flex flex-col gap-1">
                <h4 className="font-semibold">MOA - Three Sword Systems.pdf</h4>
                <p className="text-stone-500">
                  Uploaded {format(new Date(), "mm/dd/yyyy")}
                </p>
              </div>
            </div>

            <span className="text-stone-600 p-1.5 hover:bg-stone-100 transition-colors rounded-sm">
              <Download className="h-4 w-4" />
            </span>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="flex items-center gap-1 text-base font-medium mb-2">
          <FileText className="h-5 w-5" /> After
        </h3>
        <ul className="flex flex-col gap-2">
          <li className="flex gap-2 justify-between items-center p-4 border border-stone-300 rounded-sm">
            <div className="flex items-center gap-4">
              <span className="rounded-md bg-red-100 h-12 w-12 text-red-600 font-semibold flex items-center justify-center">
                PDF
              </span>

              <div className="flex flex-col gap-1">
                <h4 className="font-semibold">MOA - Three Sword Systems.pdf</h4>
                <p className="text-stone-500">
                  Uploaded {format(new Date(), "mm/dd/yyyy")}
                </p>
              </div>
            </div>

            <span className="text-stone-600 p-1.5 hover:bg-stone-100 transition-colors rounded-sm">
              <Download className="h-4 w-4" />
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default StudentDocuments;
