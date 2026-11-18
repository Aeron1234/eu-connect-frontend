"use client";

import { useEffect, useRef, useState } from "react";
import { previewAccountCsv, importAccountCsv, getImportInvitations } from "@/lib/server-actions/account-actions";
import { formatAccountCsv } from "@/lib/accountCsv.mjs";
import ResendAccountInvitation from "./ResendAccountInvitation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inputClass, labelClass, selectTriggerClass } from "./accountFormStyles";

const identityHeaders = ["first_name", "middle_initial", "last_name", "email"];
const identityExample = ["Juan", "A", "Dela Cruz", "juan@example.com"];
const templates = {
  student: { label: "Student", fields: ["school_id", "course_code", "gender"], sample: ["A12-0000", "BSCS", "male"], detail: "Use an active course code. School ID is optional. Gender accepts male or female in any capitalization." },
  employer: { label: "Employer", fields: ["username"], sample: ["juan.employer"], detail: "Provide a unique username for each employer." },
  department_head: { label: "Department Head", fields: ["username", "department_code"], sample: ["juan.head", "CCS"], detail: "Provide a unique username and an active department code." },
  admin: { label: "Admin", fields: ["username"], sample: ["juan.admin"], detail: "These accounts will have administrator access. Provide a unique username for each admin." },
};
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
  const [role, setRole] = useState("");
  const template = templates[role];
  const headers = [...identityHeaders, ...(template?.fields ?? [])];
  const templateSlug = role.replaceAll("_", "-");
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

  function changeRole(nextRole) {
    requestVersion.current++;
    setRole(nextRole);
    setCsv("");
    setRows(null);
    setResults(null);
    setError("");
    setInvitations({});
  }

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
      if (version !== requestVersion.current) return;
      setCsv(formatAccountCsv(text, role));
    } catch (error) {
      if (version === requestVersion.current) setError(error.message || "Could not read the file.");
    }
  }

  async function submit(importing) {
    if (!template || !csv || submitting.current || (importing && !validCount)) return;
    submitting.current = true; setBusy(true); setError("");
    try {
      const result = await (importing ? importAccountCsv(csv, role) : previewAccountCsv(csv, role));
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
    <h2 className="text-lg font-semibold">Import accounts</h2>
    <p className="text-sm text-muted-foreground">Choose one role per CSV. Each file can contain up to 100 accounts. Middle initials are optional. Password setup invitations are sent in the background.</p>
    <div>
      <label htmlFor="account-import-role" className={labelClass}>Account role (required)</label>
      <Select value={role} onValueChange={changeRole} disabled={busy} required>
        <SelectTrigger id="account-import-role" className={selectTriggerClass}>
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent position="popper">
          {Object.entries(templates).map(([value, entry]) => <SelectItem key={value} value={value}>{entry.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
    {template && <p className="text-sm text-muted-foreground">{template.detail}</p>}
    <button type="button" className={control} disabled={!template || busy} onClick={() => downloadCsv(templateSlug + "-accounts-template.csv", [headers, [...identityExample, ...template.sample]])}>Download CSV template</button>
    <div>
      <label htmlFor="account-csv" className="mb-1 block text-sm">Accounts CSV</label>
      <input key={role} id="account-csv" type="file" accept=".csv,text/csv" className={inputClass} disabled={!template || busy} onChange={selectFile} />
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {csv && !results && <button type="button" className={control} disabled={busy} onClick={() => submit(false)}>{busy ? "Processing..." : "Validate and preview"}</button>}
    {rows && <div className="space-y-2">
      <p className="text-sm">{validCount} ready; {rows.length - validCount} rows will be skipped. Usernames are checked again when importing.</p>
      <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50" disabled={busy || !validCount} onClick={() => submit(true)}>{busy ? "Creating accounts..." : "Create " + validCount + " " + template.label.toLowerCase() + (validCount === 1 ? " account" : " accounts")}</button>
    </div>}
    {results && <p role="status" className="text-sm">{results.filter(row => row.status === "created").length} accounts created; {failed.length} skipped or failed. Invitation delivery is tracked separately.</p>}
    {failed.length > 0 && <button type="button" className={control} onClick={() => downloadCsv(templateSlug + "-accounts-to-correct.csv", [headers, ...failed.map(row => headers.map(key => row.data[key] || ""))])}>Download rows to correct</button>}
    {displayed.length > 0 && <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead><tr>{["CSV row", "Name", "Username", ...(role === "student" ? ["Course", "Gender"] : []), ...(role === "department_head" ? ["Department"] : []), "Result", "Invitation"].map(label => <th key={label} className="whitespace-nowrap border-b border-border p-2 font-medium">{label}</th>)}</tr></thead>
        <tbody>{displayed.map(row => <tr key={row.row}>
          <td className="border-b border-border p-2">{row.row}</td>
          <td className="border-b border-border p-2">{row.data.last_name}, {row.data.first_name}<br /><span className="text-xs text-muted-foreground">{row.data.email}</span></td>
          <td className="border-b border-border p-2">{row.username || row.data.username || "—"}</td>
          {role === "student" && <>
            <td className="border-b border-border p-2">{row.data.course_code || "\u2014"}</td>
            <td className={rows ? "border-b border-border p-2 capitalize" : "border-b border-border p-2"}>
              {row.data.gender || "\u2014"}
            </td>
          </>}
          {role === "department_head" && <td className="border-b border-border p-2">{row.data.department_code || "\u2014"}</td>}
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

