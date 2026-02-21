import Image from "next/image";
import fileIcon from "@/public/document-icon.png";

function FileCard() {
  return (
    <li className="flex flex-col cursor-pointer hover:bg-stone-50 transition-colors">
      <div className="flex-1 flex justify-center bg-primary-500 rounded-t-md px-5 py-2">
        <Image
          src={fileIcon}
          quality={[100, 70, 70, 70, 70, 70, 75]}
          height="60"
          width="60"
          loading="eager"
          alt="document icon"
        />
      </div>
      <div className="flex-1 flex flex-col gap-1 px-2 py-1 border border-stone-200 rounded-b-md wrap-break-word">
        <h4 className="font-bold">Before</h4>
        <div className="">
          <span className="text-stone-500">Date uploaded:</span>
          <p>12/12/26</p>
        </div>
        <div className="">
          <span className="text-stone-500">File name:</span>
          <p>qwerty_document.docs</p>
        </div>
      </div>
    </li>
  );
}

export default FileCard;
