import FileCard from "app/_components/FileCard";
import PageContainer from "app/_components/PageContainer";
import PageTitle from "app/_components/PageTitle";
import { Button } from "components/ui/button";
import { Check, Plus } from "lucide-react";
import Filter from "app/_components/Filter";
import { notFound } from "next/navigation";
import { auth } from "@/app/_services/auth";

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
            <h3 className="font-bold text-stone-600">Before Internship</h3>

            <ul className="pl-2">
              <li className="flex gap-1 items-center">
                <Check strokeWidth={3} color="var(--color-primary-500)" />

                {/* <Checkbox /> */}

                <p>Curriculum Vitae</p>
              </li>
              <li className="flex gap-1 items-center">
                <Check strokeWidth={3} color="var(--color-primary-500)" />

                <p>Student's Registration</p>
              </li>
              <li className="flex gap-1 items-center">
                <Check strokeWidth={3} color="var(--color-primary-500)" />

                <p>Endorsement letter / Recommendation letter</p>
              </li>
              <li className="flex gap-1 items-center">
                <Check strokeWidth={3} color="var(--color-primary-500)" />

                <p>Training Agreement - notarize</p>
              </li>
              <li className="flex gap-1 items-center">
                <Check strokeWidth={3} color="var(--color-primary-500)" />

                <p>Parent's Consent with valid ID - notarize</p>
              </li>
              <li className="flex gap-1 items-center">
                <Check strokeWidth={3} color="var(--color-primary-500)" />

                <p>Memorandum of Agreement - notarize</p>
              </li>
              <li className="flex gap-1 items-center">
                <Check strokeWidth={3} color="var(--color-primary-500)" />

                <p>Medical / Psychological Certificate</p>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-stone-600">After Internship</h3>

            <ul className="pl-2">
              <li className="flex gap-1 items-center">
                <Check strokeWidth={3} color="var(--color-primary-500)" />

                <p>Weekly Journal</p>
              </li>
              <li className="flex gap-1 items-center">
                <Check strokeWidth={3} color="var(--color-primary-500)" />

                <p>Summary Report</p>
              </li>
              <li className="flex gap-1 items-center">
                <Check strokeWidth={3} color="var(--color-primary-500)" />

                <p>Daily Time Record (DTR)</p>
              </li>
              <li className="flex gap-1 items-center">
                <Check strokeWidth={3} color="var(--color-primary-500)" />

                <p>Certificate of Completion</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2 font-bold text-base">
          <div className="flex items-center justify-between py-2">
            <div className="flex gap-2 items-center">
              <Button
                className={
                  "bg-primary-500 hover:bg-primary-400 cursor-pointer w-fit"
                }
              >
                <Plus strokeWidth={4} />
              </Button>
              <h3 className="">Upload Files</h3>
            </div>
            <Filter />
          </div>

          <ul className=" grid grid-cols-6 gap-4 items-start font-normal text-xs">
            <FileCard />
            <FileCard />
            <FileCard />
            <FileCard />
            <FileCard />
            <FileCard />
            <FileCard />
            <FileCard />
          </ul>
        </div>
      </div>
    </PageContainer>
  );
}

export default StoragePage;
