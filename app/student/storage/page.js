import PageContainer from "app/_components/PageContainer";
import Modal from "@/app/_components/Modal";
import StorageUploadForm from "@/app/_components/StorageUploadForm";
import StorageFilesList from "@/app/_components/StorageFilesList";
import { getInternshipFiles } from "@/app/_services/services";
import { Upload } from "lucide-react";

import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export const metadata = {
  title: "Student's Storage",
};

async function StoragePage({ searchParams }) {
  const params = await searchParams;

  const internshipFiles = await getInternshipFiles();

  return (
    <PageContainer>
      <header className="flex items-start justify-between gap-4 mt-4 max-xs:flex-col">
        <div>
          <h1 className="text-xl self-start font-bold text-stone-800 max-md:text-lg max-xs:text-base">
            Internship Documents Storage
          </h1>
          <span className="text-stone-600 max-xs:text-xs">
            Upload all of your internship-related files here
          </span>
        </div>

        <Modal
          trigger={
            <div className="bg-primary-500 hover:bg-primary-400 cursor-pointer p-2 rounded-sm transition-colors flex gap-2 items-center justify-center max-xs:w-full">
              <Upload strokeWidth={3} size={16} color="#fff" />
              <span className="text-white text-sm font-semibold">
                Upload File
              </span>
            </div>
          }
          description="Save your internship related documents here."
          triggerStyles="max-xs:w-full"
          title={"Upload file"}
        >
          <StorageUploadForm />
        </Modal>
      </header>

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
    </PageContainer>
  );
}

export default StoragePage;
