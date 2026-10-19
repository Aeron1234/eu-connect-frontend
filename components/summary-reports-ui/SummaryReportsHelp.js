"use client";

import ManualDialog from "@/components/ui/ManualDialog";

export default function SummaryReportsHelp() { return (
    <ManualDialog title="How to write your summary report">
      <ol
        className="list-decimal space-y-3 pl-5 text-sm leading-relaxed marker:font-semibold marker:text-primary-emphasis"
      >
        <li>Choose the internship you want to write about. You can create one report for each eligible internship.</li>
        <li>Write paragraphs about the organization, your work schedule, a memorable moment, and difficulties with their solutions.</li>
        <li>Optionally add a memorabilia note and up to six JPG, PNG, or WebP images. Preview each image before saving.</li>
        <li>Keep the report within 900 words. Follow the school format: Times New Roman, 12 pt, 1.5 line spacing, 1-inch margins, and a maximum of three pages.</li>
        <li>Select <strong>Submit report</strong>. You can edit or delete your report later. Only one report can exist for an internship at a time.</li>
        <li>Use <strong>Export PDF</strong> to download the formatted PDF after it is ready. Your saved images appear inside it.</li>
      </ol>
    </ManualDialog>
  );
}
