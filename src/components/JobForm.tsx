import { useState } from "react";
import type { Job, JobStatus } from "@/lib/api";
import { STATUSES } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function JobForm({ initial, onSubmit, onCancel }: { initial?: Partial<Job>; onSubmit: (data: any) => Promise<void>; onCancel?: () => void }) {
  const [form, setForm] = useState({
    company_name: initial?.company_name || "",
    role_title: initial?.role_title || "",
    status: (initial?.status || "applied") as JobStatus,
    applied_date: initial?.applied_date?.slice(0, 10) || "",
    interview_date: initial?.interview_date?.slice(0, 10) || "",
    salary_range: initial?.salary_range || "",
    job_url: initial?.job_url || "",
    job_description: initial?.job_description || "",
    notes: initial?.notes || "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload: any = { ...form };
        Object.keys(payload).forEach((k) => payload[k] === "" && delete payload[k]);
        try { await onSubmit(payload); } finally { setLoading(false); }
      }}
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Company *</Label><Input required value={form.company_name} onChange={(e) => set("company_name", e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Role *</Label><Input required value={form.role_title} onChange={(e) => set("role_title", e.target.value)} /></div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Salary range</Label><Input placeholder="$80k–$110k" value={form.salary_range} onChange={(e) => set("salary_range", e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Applied date</Label><Input type="date" value={form.applied_date} onChange={(e) => set("applied_date", e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Interview date</Label><Input type="date" value={form.interview_date} onChange={(e) => set("interview_date", e.target.value)} /></div>
      </div>
      <div className="space-y-1.5"><Label>Job URL</Label><Input type="url" placeholder="https://…" value={form.job_url} onChange={(e) => set("job_url", e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Job description</Label><Textarea rows={6} value={form.job_description} onChange={(e) => set("job_description", e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Notes</Label><Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
      <div className="flex gap-2 justify-end pt-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
      </div>
    </form>
  );
}
