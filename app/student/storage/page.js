import FileCard from "app/_components/FileCard";
import PageContainer from "app/_components/PageContainer";
import PageTitle from "app/_components/PageTitle";
import { Button } from "components/ui/button";
import { Check, Plus } from "lucide-react";
import Filter from "app/_components/Filter";
import { notFound } from "next/navigation";
import { auth } from "@/app/_services/auth";
import Modal from "@/app/_components/Modal";
import StorageUploadForm from "@/app/_components/StorageUploadForm";
import StorageFilesList from "@/app/_components/StorageFilesList";
import { Suspense } from "react";
import RequirementsBefore from "@/app/_components/RequirementsBefore";
import RequirementsAfter from "@/app/_components/RequirementsAfter";

export const metadata = {
  title: "Student's Storage",
};

async function StoragePage() {
  const session = await auth();
  if (!session?.user) return notFound();

  const role = session.user.role;
  if (role !== "student") return notFound();

  return (
    <PageContainer>
      <PageTitle title="Internship Documents Storage" />

      <div className="p-4 flex flex-col flex-1 bg-white rounded-md shadow-sm gap-4 text-stone-800">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">List of Requirements</h2>
        </div>

        <div className="pb-4 border-b border-stone-300 grid grid-cols-2 gap-4 font-semibold">
          <div className="flex flex-col gap-2 text-sm font-semi-bold">
            <RequirementsBefore />
          </div>

          <div className="flex flex-col gap-2">
            <RequirementsAfter />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2 font-bold text-base">
          <div className="flex items-center justify-between py-2">
            <div className="flex gap-2 items-center">
              <Modal
                trigger={
                  <div>
                    <Plus strokeWidth={2} color="var(--color-primary-50)" />
                  </div>
                }
                triggerStyles={
                  "bg-primary-500 hover:bg-primary-400 cursor-pointer p-0.5 rounded-sm transition-colors"
                }
                title={"Upload file"}
              >
                <StorageUploadForm />
              </Modal>
              <h3 className="">Upload Files</h3>
            </div>
            <Filter />
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <StorageFilesList />
          </Suspense>
        </div>
      </div>
    </PageContainer>
  );
}

export default StoragePage;
