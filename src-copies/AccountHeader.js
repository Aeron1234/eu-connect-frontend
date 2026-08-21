import { Camera } from "lucide-react";
import Image from "next/image";
// import gradpic from "../../public/gradpic.png";
import gradpic from "@/public/gradpic.png";

function AccountHeader({ fullName, department = "", company = "", email }) {
  return (
    <div className="px-6 py-6  bg-linear-to-l from-primary-500 to-primary-50 rounded-md flex gap-8 shadow-sm">
      <div className="rounded-full relative ring-4 ring-offset-white ring-offset-4 ring-primary-500 outline-none offs">
        <Image
          src={gradpic}
          height="120"
          width="120"
          loading="eager"
          alt="The Wild Oasis logo"
          className="rounded-full"
        />

        <button className="absolute p-1 cursor-pointer bg-white rounded-full bottom-0 right-0 -translate-x-3 -translate-y-1 hover:bg-stone-200 transition-colors">
          <Camera size={16} color="var(--color-stone-800)" />
        </button>
      </div>

      <div className="flex flex-col gap-1 font-semibold text-xs text-primary-400 self-end">
        <span className="text-base text-primary-500 font-bold">{fullName}</span>
        <span>{department || company}</span>
        <span>{email}</span>
      </div>
    </div>
  );
}

export default AccountHeader;
