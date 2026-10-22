"use client";

import ManualDialog from "@/components/ui/ManualDialog";

export default function SummaryReportsHelp() { return (
    <ManualDialog title="How to write your summary report">
      <ol
        className="list-decimal space-y-3 pl-5 text-sm leading-relaxed marker:font-semibold marker:text-primary-emphasis"
      >
        <li>Choose the internship you want to write about. You can create one report for each approved ongoing or finished internship once its start date arrives in Philippine time.</li>
        <li>You can build your report throughout your internship; you do not need to wait until it is finished.</li>
        <li>Write paragraphs about the organization, your work schedule, a memorable moment, and difficulties with their solutions.</li>
        <li>Optionally add a memorabilia note and up to six JPG, PNG, or WebP images. Preview each image before saving.</li>
        <li>Keep the report within 900 words. The PDF follows the school template: Times New Roman, a 13 pt title, 12 pt body, 1.5 line spacing, 1 cm margins, and a maximum of three pages.</li>
        <li>Select <strong>Submit report</strong>. You can edit or delete your report later. Only one report can exist for an internship at a time.</li>
        <li>Use <strong>Export PDF</strong> to preview the formatted report, then choose <strong>Print</strong> or <strong>Download</strong>. Your saved images appear inside it.</li>
      </ol>
    </ManualDialog>
  );
}
