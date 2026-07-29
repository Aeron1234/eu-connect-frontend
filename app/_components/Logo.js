import Image from "next/image";
import logo from "@/public/logo.png";

function Logo() {
  return (
    <div className="relative w-16 h-16 md:w-20 md:h-20 aspect-square">
      <Image
        src={logo}
        alt="the eu-connect logo"
        fill
        sizes="(max-width: 768px) 64px, 80px"
        className="object-contain"
        priority
      />
    </div>
  );
}

export default Logo;
