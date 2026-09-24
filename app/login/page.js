import LoginForm from "../_components/LoginForm";
import logo from "@/public/logo.png";
import { ArrowLeft, BarChart3, Clock, FileText, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Log in",
};

const highlights = [
  { icon: Clock, label: "Time tracking & DTR" },
  { icon: FileText, label: "Document management" },
  { icon: BarChart3, label: "Progress analytics" },
  { icon: MapPin, label: "Internship placement map" },
];

function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      {/* Brand panel */}
      <aside className="relative overflow-hidden bg-primary-500 px-10 py-12 text-primary-foreground lg:px-14">
        <div
          className="pointer-events-none absolute -left-24 -top-40 h-96 w-96 rounded-full border border-primary-foreground/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-primary-foreground/[0.04]"
          aria-hidden="true"
        />
        <div className="relative flex h-full flex-col">
          <Link
            href={"/"}
            className="inline-flex items-center gap-2 text-sm text-primary-foreground/85 transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="mt-16">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-background">
              <Image
                src={logo}
                alt="MSEUF-CI seal"
                width={80}
                height={80}
                loading="eager"
                className="h-25 w-25 object-contain"
              />
            </div>
            <h1 className="mt-12 font-display text-5xl font-bold">
              EU-Connect
            </h1>
            <p className="mt-5 max-w-xs text-lg leading-relaxed text-primary-foreground/80">
              The official internship management platform of MSEUF-CI.
            </p>

            <ul className="mt-12 space-y-5">
              {highlights.map((h) => (
                <li key={h.label} className="flex items-center gap-4 text-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10">
                    <h.icon className="h-4 w-4" />
                  </span>
                  {h.label}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-auto pt-16 text-xs leading-relaxed text-primary-foreground/50">
            Manuel S. Enverga University Foundation
            <br />
            Candelaria, Inc. — © 2026
          </p>
        </div>
      </aside>
      <LoginForm />
    </div>
  );
}

export default LoginPage;
