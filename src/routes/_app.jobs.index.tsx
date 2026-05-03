import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { jobsApi, type Job, type JobStatus, STATUSES } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

export const Route = createFileRoute("/_app/jobs/")({ component: JobsList });

function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<JobStatus | "all">("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    jobsApi.list({ limit: 100, status: filter === "all" ? undefined : filter })
      .then((d: any) => setJobs(d.jobs || d || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const filtered = jobs.filter((j) => !q || (j.company_name + j.role_title).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">{jobs.length} total</p>
        </div>
        <Button asChild><Link to="/jobs/new"><Plus className="size-4 mr-1" />New</Link></Button>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search company or role…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All</FilterChip>
          {STATUSES.map((s) => (
            <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>{s}</FilterChip>
          ))}
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">No applications found.</p>
            <Button asChild className="mt-4"><Link to="/jobs/new">Add one</Link></Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Company</th>
                <th className="text-left font-medium px-4 py-2.5">Role</th>
                <th className="text-left font-medium px-4 py-2.5">Status</th>
                <th className="text-left font-medium px-4 py-2.5">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((j) => (
                <tr key={j.id} className="hover:bg-accent/40 cursor-pointer">
                  <td className="px-4 py-3"><Link to="/jobs/$id" params={{ id: j.id }} className="font-medium">{j.company_name}</Link></td>
                  <td className="px-4 py-3 text-muted-foreground"><Link to="/jobs/$id" params={{ id: j.id }}>{j.role_title}</Link></td>
                  <td className="px-4 py-3"><StatusBadge status={j.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{j.applied_date ? new Date(j.applied_date).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-md text-xs capitalize border transition ${active ? "bg-foreground text-background border-foreground" : "bg-card hover:bg-accent text-muted-foreground"}`}>{children}</button>
  );
}
