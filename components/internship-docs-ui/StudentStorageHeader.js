"use client";

import Modal from "@/components/ui/Modal";
import HelpManual from "@/components/help-ui/HelpManual";
import StorageUploadForm from "./StorageUploadForm";
import { FolderOpen, Upload } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";
import TitleButton from "@/components/ui/TitleButton";

export default function StudentStorageHeader({ ongoing, fileRequirementTypes, currentUserId, activeQuery, typesQuery }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <PageTitle
          Icon={FolderOpen}
          title="Internship Documents Storage"
          description="Upload all of your internship-related files here."
          titleAction={<HelpManual guideId="storage" title="How to use internship storage" />}
        />
      </div>

      {(activeQuery.isPending || typesQuery.isPending || activeQuery.isError || typesQuery.isError) ? (
        <div aria-disabled="true" className="w-full cursor-not-allowed opacity-50 md:ml-auto md:w-auto">
          <TitleButton><Upload className="w-4 h-4" /> Upload File</TitleButton>
        </div>
      ) : ongoing ? <div className="w-full md:ml-auto md:w-auto"><Modal variant="form"
        trigger={
          <TitleButton>
            <Upload className="w-4 h-4" /> Upload File
          </TitleButton>
        }
        triggerStyles="w-full md:w-auto"
        title={"Upload file"}
      >
        <StorageUploadForm
          fileRequirementTypes={fileRequirementTypes}
          currentUserId={currentUserId}
          internshipId={ongoing?.id}
        />
      </Modal></div> : null}
    </div>
  );
}
