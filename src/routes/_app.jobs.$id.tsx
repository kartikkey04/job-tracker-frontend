import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { jobsApi, type Job, STATUSES, type JobStatus } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { JobForm } from "@/components/JobForm";
import { ArrowLeft, Trash2, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/jobs/$id")({ component: JobDetail });

function JobDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [editing, setEditing] = useState(false);

  const load = () => jobsApi.get(id).then((d) => setJob(d.job)).catch((e) => toast.error(e.message));
  useEffect(() => { load(); }, [id]);

  if (!job) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;

  const updateStatus = async (status: JobStatus) => {
    try { const r = await jobsApi.update(id, { status }); setJob(r.job); toast.success(`Moved to ${status}`); }
    catch (e: any) { toast.error(e.message); }
  };

  const remove = async () => {
    if (!confirm("Delete this application?")) return;
    try { await jobsApi.remove(id); toast.success("Deleted"); router.navigate({ to: "/jobs" }); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link to="/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-4 mr-1" /> Back</Link>

      {editing ? (
        <>
          <h1 className="text-2xl font-semibold tracking-tight mb-6">Edit application</h1>
          <JobForm initial={job} onCancel={() => setEditing(false)} onSubmit={async (data) => {
            try { const r = await jobsApi.update(id, data); setJob(r.job); setEditing(false); toast.success("Updated"); }
            catch (e: any) { toast.error(e.message); }
          }} />
        </>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight">{job.role_title}</h1>
              <p className="text-muted-foreground">{job.company_name}</p>
              <div className="mt-3 flex items-center gap-2"><StatusBadge status={job.status} /></div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Select value={job.status} onValueChange={(v) => updateStatus(v as JobStatus)}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="ghost" size="icon" onClick={remove}><Trash2 className="size-4" /></Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            <Field label="Applied" value={job.applied_date ? new Date(job.applied_date).toLocaleDateString() : "—"} />
            <Field label="Interview" value={job.interview_date ? new Date(job.interview_date).toLocaleDateString() : "—"} />
            <Field label="Salary" value={job.salary_range || "—"} />
            <Field label="Link" value={job.job_url ? <a href={job.job_url} target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-4 inline-flex items-center gap-1">Open <ExternalLink className="size-3" /></a> : "—"} />
          </div>

          {job.job_description && <Section title="Job description"><p className="whitespace-pre-wrap text-sm leading-relaxed">{job.job_description}</p></Section>}
          {job.notes && <Section title="Notes"><p className="whitespace-pre-wrap text-sm leading-relaxed">{job.notes}</p></Section>}

          <div className="mt-8 p-4 border rounded-lg bg-accent/30">
            <div className="text-sm font-medium mb-2">Need help with this one?</div>
            <p className="text-sm text-muted-foreground mb-3">Use AI to generate a cover letter, get interview tips, or check resume fit.</p>
            <Button asChild variant="outline" size="sm"><Link to="/ai">Open AI tools</Link></Button>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border rounded-lg p-3 bg-card">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm mt-1">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="text-sm font-medium text-muted-foreground mb-2">{title}</h2>
      <div className="border rounded-lg p-4 bg-card">{children}</div>
    </div>
  );
}
