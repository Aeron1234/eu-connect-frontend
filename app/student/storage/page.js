import Modal from "@/app/_components/Modal";
import StorageUploadForm from "@/app/_components/StorageUploadForm";
import RecordsDocuments from "@/app/_components/RecordsDocuments";
import PastInternshipDocuments from "@/app/_components/PastInternshipDocuments";
import {
  getFileRequirementTypes,
  getInternshipFiles,
  getMyPastInternshipRecords,
  downloadInternshipFile,
  getOngoingInternshipRecord,
} from "@/app/_services/services";
import { getUserSession } from "@/app/_services/auth";
import { FolderOpen, Upload } from "lucide-react";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import PageTitle from "@/app/_components/PageTitle";

export const metadata = {
  title: "Student's Storage",
};

async function StoragePage() {
  const [ongoing, fileRequirementTypes, session] = await Promise.all([
    getOngoingInternshipRecord(),
    getFileRequirementTypes(),
    getUserSession(),
  ]);

  const currentUserId = session?.user?.id || "";

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitle
          Icon={FolderOpen}
          title={"Internship Documents Storage"}
          description={"Upload all of your internship-related files here."}
        />

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

      <Suspense
        fallback={
          <div className="self-center justify-self-center p-5">
            <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
          </div>
        }
      >
        <CurrentInternshipDocs
          ongoing={ongoing}
          requirementTypes={fileRequirementTypes}
          currentUserId={currentUserId}
        />
        <PastInternshipsSection currentUserId={currentUserId} />
      </Suspense>
    </main>
  );
}

async function CurrentInternshipDocs({
  ongoing,
  requirementTypes,
  currentUserId,
}) {
  if (!ongoing) {
    return (
      <div className="rounded-xl border border-dashed border-stone-200 p-10 text-center text-sm text-stone-500">
        You don&apos;t currently have an ongoing internship.
      </div>
    );
  }

  const currentDocs = await getInternshipFiles({ internshipId: ongoing.id });

  return (
    <RecordsDocuments
      fileData={currentDocs || []}
      requirementTypes={requirementTypes || []}
      internshipId={ongoing.id}
      userRole="student"
      currentUserId={currentUserId}
      downloadAction={downloadInternshipFile}
    />
  );
}

async function PastInternshipsSection({ currentUserId }) {
  const pastRecords = await getMyPastInternshipRecords();
  return (
    <PastInternshipDocuments
      records={pastRecords || []}
      currentUserId={currentUserId}
    />
  );
}

export default StoragePage;
