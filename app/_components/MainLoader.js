import Image from "next/image";
import logo from "@/public/logo.png";

function MainLoader() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-white px-6">
      {/* Dark maroon-tinted glass panel, floating on the white base layer */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#2b0a10]/75 px-8 py-10 shadow-2xl backdrop-blur-xl sm:px-12 sm:py-14">
        {/* Subtle top sheen — the one glass "tell", kept restrained */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />

        <div className="relative flex flex-col items-center gap-6">
          <div className="relative h-28 w-28 sm:h-36 sm:w-36">
            {/* Faint full ring — the track */}
            <span className="absolute inset-0 rounded-full border-[3px] border-white/10" />

            {/* Rotating arc — the only motion here, a plain loading
                spinner shape with no straight lines through the center */}
            <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary-300 border-r-primary-300/60 loading-spin" />

            {/* Soft pulse behind the seal */}
            <span className="absolute inset-4 rounded-full bg-primary-400/20 loading-pulse sm:inset-5" />

            {/* Seal — kept white, echoing the page's base layer */}
            <div className="absolute inset-4 flex items-center justify-center rounded-full bg-white p-2 shadow-md sm:inset-5">
              <div className="relative h-full w-full">
                <Image
                  src={logo}
                  alt="EU-Connect seal"
                  fill
                  sizes="(max-width: 640px) 64px, 80px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="loading-fade-in flex max-w-xs flex-col items-center gap-1 text-center">
            <p className="text-xl font-bold tracking-tight text-white">
              EU-Connect
            </p>
            <p className="text-sm font-medium text-primary-200">
              Connecting Interns to Opportunities
            </p>
            <p className="mt-1 text-xs text-white/60">
              Manuel S. Enverga University Foundation &mdash; Candelaria Inc.
            </p>
            <p className="mt-2 text-xs text-white/40">
              Setting up your workspace&hellip;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainLoader;
