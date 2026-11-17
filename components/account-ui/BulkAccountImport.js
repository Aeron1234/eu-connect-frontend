"use client";

import { useEffect, useRef, useState } from "react";
import { previewStudentCsv, importStudentCsv, getImportInvitations } from "@/lib/server-actions/account-actions";
import ResendAccountInvitation from "./ResendAccountInvitation";
import { inputClass } from "./accountFormStyles";

const headers = ["first_name", "middle_initial", "last_name", "email", "school_id", "course_code", "gender"];
const control = "rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50";
function downloadCsv(filename, rows) {
  const cell = value => '"' + String(value ?? "").replace(/^[=+@\t\r-]/, "'$&").replaceAll('"', '""') + '"';
  const blob = new Blob(["\uFEFF" + rows.map(row => row.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function BulkAccountImport({ onCreated }) {
  const [csv, setCsv] = useState("");
  const [rows, setRows] = useState(null);
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [invitations, setInvitations] = useState({});
  const requestVersion = useRef(0);
  const submitting = useRef(false);
  const ids = results?.filter(row => row.status === "created").map(row => row.accountId).join(",") || "";
  useEffect(() => {
    if (!ids) return;
    let active = true;
    async function refresh() {
      const result = await getImportInvitations(ids.split(","));
      if (!active) return;
      if (result.success) setInvitations(Object.fromEntries(result.invitations.map(row => [row.user_id, row.status])));
    }
    void refresh();
    const timer = setInterval(refresh, 10000);
    return () => { active = false; clearInterval(timer); };
  }, [ids]);

  async function selectFile(event) {
    const version = ++requestVersion.current;
    setRows(null); setResults(null); setCsv(""); setError(""); setInvitations({});
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv") || file.size > 256 * 1024) {
      setError("Choose a CSV file of at most 256 KB."); return;
    }
    try {
      const text = await file.text();
      if (version === requestVersion.current) setCsv(text);
    } catch { if (version === requestVersion.current) setError("Could not read the file."); }
  }

  async function submit(importing) {
    if (submitting.current) return;
    submitting.current = true; setBusy(true); setError("");
    try {
      const result = await (importing ? importStudentCsv(csv) : previewStudentCsv(csv));
      if (!result.success) { setError(result.error || result.message || "The request failed."); return; }
      if (importing) { setResults(result.results); setRows(null); onCreated?.(); }
      else { setRows(result.rows); setResults(null); }
    } catch { setError("The request could not be completed. Refresh the preview before retrying."); }
    finally { submitting.current = false; setBusy(false); }
  }
  const displayed = results || rows || [];
  const validCount = rows?.filter(row => !row.error).length || 0;
  const failed = results?.filter(row => row.status !== "created") || [];
  return <section className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
    <h2 className="text-lg font-semibold">Import student accounts</h2>
    <p className="text-sm text-muted-foreground">Upload up to 100 students. Use an active course code, such as BSCS. School ID and middle initial are optional. Invitations are sent in the background.</p>
    <button type="button" className={control} onClick={() => downloadCsv("student-accounts-template.csv", [headers, ["Juan", "A", "Dela Cruz", "juan@example.com", "A12-0000", "BSCS", "male"]])}>Download CSV template</button>
    <div>
      <label htmlFor="account-csv" className="mb-1 block text-sm">Student accounts CSV</label>
      <input id="account-csv" type="file" accept=".csv,text/csv" className={inputClass} disabled={busy} onChange={selectFile} />
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {csv && !results && <button type="button" className={control} disabled={busy} onClick={() => submit(false)}>{busy ? "Processing..." : "Validate and preview"}</button>}
    {rows && <div className="space-y-2">
      <p className="text-sm">{validCount} ready; {rows.length - validCount} rows will be skipped. Usernames are checked again when importing.</p>
      <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50" disabled={busy || !validCount} onClick={() => submit(true)}>{busy ? "Creating accounts..." : "Create " + validCount + " accounts"}</button>
    </div>}
    {results && <p role="status" className="text-sm">{results.filter(row => row.status === "created").length} accounts created; {failed.length} skipped or failed. Invitation delivery is tracked separately.</p>}
    {failed.length > 0 && <button type="button" className={control} onClick={() => downloadCsv("student-accounts-to-correct.csv", [headers, ...failed.map(row => headers.map(key => row.data[key] || ""))])}>Download rows to correct</button>}
    {displayed.length > 0 && <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead><tr>{["CSV row", "Student", "Username", "Result", "Invitation"].map(label => <th key={label} className="whitespace-nowrap border-b border-border p-2 font-medium">{label}</th>)}</tr></thead>
        <tbody>{displayed.map(row => <tr key={row.row}>
          <td className="border-b border-border p-2">{row.row}</td>
          <td className="border-b border-border p-2">{row.data.last_name}, {row.data.first_name}<br /><span className="text-xs text-muted-foreground">{row.data.email}</span></td>
          <td className="border-b border-border p-2">{row.username || "—"}</td>
          <td className="border-b border-border p-2">{row.error || row.message || "Ready"}</td>
          <td className="border-b border-border p-2">
            {row.accountId ? invitations[row.accountId] || "pending" : "—"}
            {row.accountId && invitations[row.accountId] === "failed" && <ResendAccountInvitation accountId={row.accountId} onSuccess={result => {
              if (result.invitation_sent) setInvitations(previous => ({ ...previous, [row.accountId]: "sent" }));
            }} />}
          </td>
        </tr>)}</tbody>
      </table>
    </div>}
  </section>;
}

