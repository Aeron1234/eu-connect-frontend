"use client";

import Image from "next/image";

export default function SummaryReportImages({ images }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((image) => (
        <a
          key={image.id}
          href={image.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-lg border border-border bg-canvas"
        >
          <Image
            unoptimized
            src={image.url}
            alt="Internship memorabilia"
            width={320}
            height={240}
            className="h-32 w-full object-contain"
          />
        </a>
      ))}
    </div>
  );
}
