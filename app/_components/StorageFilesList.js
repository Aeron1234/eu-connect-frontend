import FileCard from "./FileCard";

function StorageFilesList() {
  return (
    <ul className=" grid grid-cols-8 gap-4 items-start font-normal text-xs">
      <FileCard />
      <FileCard />
      <FileCard />
      <FileCard />
      <FileCard />
      <FileCard />
      <FileCard />
      <FileCard />
    </ul>
  );
}

export default StorageFilesList;
