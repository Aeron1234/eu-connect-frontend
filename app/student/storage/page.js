import PageContainer from "app/_components/PageContainer";
import Modal from "@/app/_components/Modal";
import StorageUploadForm from "@/app/_components/StorageUploadForm";
import StorageFilesList from "@/app/_components/StorageFilesList";
import {
  getFileRequirementTypes,
  getInternshipFiles,
} from "@/app/_services/services";
import { FolderOpen, Upload } from "lucide-react";

import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export const metadata = {
  title: "Student's Storage",
};

async function StoragePage({ searchParams }) {
  const params = await searchParams;

  const [internshipFiles, fileRequirementTypes] = await Promise.all([
    getInternshipFiles(),
    getFileRequirementTypes(),
  ]);

  console.log(fileRequirementTypes);
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-primary-500" />
            Internship Documents Storage
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Upload all of your internship-related files here
          </p>
        </div>

        <Modal
          trigger={
            <div className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition">
              <Upload className="w-4 h-4" />
              <span className="text-white text-sm font-semibold">
                Upload File
              </span>
            </div>
          }
          description="Save your internship related documents here."
          triggerStyles="max-xs:w-full"
          title={"Upload file"}
        >
          <StorageUploadForm fileRequirementTypes={fileRequirementTypes} />
        </Modal>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <Suspense
          fallback={
            <div className="self-center justify-self-center p-5">
              <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
            </div>
          }
        >
          <StorageFilesList params={params} internshipFiles={internshipFiles} />
        </Suspense>
      </div>
    </main>
  );
}

export default StoragePage;
