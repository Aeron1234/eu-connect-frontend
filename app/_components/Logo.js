import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";

function Logo() {
  return (
    <Link href="/" className="rounded-full">
      <Image
        src={logo}
        quality={[100, 70, 70, 70, 70, 70, 75]}
        height="45"
        width="45"
        loading="eager"
        alt="The Wild Oasis logo"
      />
    </Link>
  );
}

export default Logo;
