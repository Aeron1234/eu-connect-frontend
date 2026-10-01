import Image from "next/image";
import logo from "@/public/logo.png";

function Logo({ compactOnDesktop = false }) {
  const dimensions = `w-16 h-16 md:w-20 md:h-20 ${compactOnDesktop ? "lg:w-10 lg:h-10" : ""}`;

  return (
    <div
      className={`relative ${dimensions} aspect-square transition-all duration-300`}
    >
      <Image
        src={logo}
        alt="the eu-connect logo"
        fill
        sizes="(max-width: 768px) 64px, 80px"
        loading="eager"
        className="object-contain"
        priority
      />
    </div>
  );
}

export default Logo;
