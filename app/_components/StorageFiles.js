"use client";
import { useInternshipFiles } from "../_services/tanstack-queries";
import SpinnerBig from "./SpinnerBig";
import StorageFilesList from "./StorageFilesList";

function StorageFiles({ params }) {
  const { data: internshipFiles, isPending: isLoadingFiles } =
    useInternshipFiles();

  if (isLoadingFiles) {
    return <SpinnerBig />;
  }

  return <StorageFilesList params={params} internshipFiles={internshipFiles} />;
}

export default StorageFiles;
