import Modal from "@/app/_components/Modal";
import StorageUploadForm from "@/app/_components/StorageUploadForm";
import RecordsDocuments from "@/app/_components/RecordsDocuments";
import PastInternshipDocuments from "@/app/_components/PastInternshipDocuments";
import {
  getOngoingInternshipRecord,
  getMyPastInternshipRecords,
} from "@/lib/server-actions/internship-records-actions";
import {
  getInternshipFiles,
  downloadInternshipFile,
  getFileRequirementTypes,
} from "@/lib/server-actions/internship-docs-actions";

import { getUserSession } from "@/lib/server-actions/auth";
import { FolderOpen, Upload } from "lucide-react";
import PageTitle from "@/app/_components/PageTitle";
import TitleButton from "@/app/_components/TitleButton";

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
            <TitleButton>
              <Upload className="w-4 h-4" /> Upload File
            </TitleButton>
          }
          description="Save your internship related documents here."
          triggerStyles="max-xs:w-full"
          title={"Upload file"}
        >
          <StorageUploadForm fileRequirementTypes={fileRequirementTypes} />
        </Modal>
      </div>

      <CurrentInternshipDocs
        ongoing={ongoing}
        requirementTypes={fileRequirementTypes}
        currentUserId={currentUserId}
      />
      <PastInternshipsSection currentUserId={currentUserId} />
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
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
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
