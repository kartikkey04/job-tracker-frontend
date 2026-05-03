import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { jobsApi, type Job, STATUSES } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { Briefcase, TrendingUp, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recent, setRecent] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([jobsApi.stats(), jobsApi.list({ limit: 5, sort: "created_at", order: "desc" })])
      .then(([s, j]: any) => {
        const raw = s.stats;
        const normalized: Record<string, number> = {};
        if (Array.isArray(raw)) raw.forEach((r: any) => (normalized[r.status] = Number(r.count)));
        else Object.assign(normalized, raw);
        setStats(normalized);
        setRecent(j.jobs || j.data?.jobs || j || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = Object.values(stats).reduce((a, b) => a + Number(b || 0), 0);
  const active = (stats.applied || 0) + (stats.screening || 0) + (stats.interview || 0);
  const offers = stats.offer || 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's a snapshot of your job hunt.</p>
        </div>
        <Button asChild><Link to="/jobs/new"><Plus className="size-4 mr-1" /> New application</Link></Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Briefcase} label="Total applications" value={total} />
        <StatCard icon={TrendingUp} label="Active" value={active} hint="Applied · Screening · Interview" />
        <StatCard icon={Calendar} label="Offers" value={offers} />
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">By status</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {STATUSES.map((s) => (
            <div key={s} className="border rounded-lg p-3 bg-card">
              <StatusBadge status={s} />
              <div className="text-2xl font-semibold mt-2">{stats[s] || 0}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">Recent applications</h2>
          <Link to="/jobs" className="text-sm text-foreground underline underline-offset-4">View all</Link>
        </div>
        <div className="border rounded-lg bg-card divide-y">
          {loading && <div className="p-6 text-sm text-muted-foreground">Loading…</div>}
          {!loading && recent.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-sm text-muted-foreground">No applications yet.</p>
              <Button asChild className="mt-4"><Link to="/jobs/new">Add your first one</Link></Button>
            </div>
          )}
          {recent.map((j) => (
            <Link key={j.id} to="/jobs/$id" params={{ id: j.id }} className="flex items-center justify-between p-4 hover:bg-accent/40 transition">
              <div className="min-w-0">
                <div className="font-medium truncate">{j.role_title}</div>
                <div className="text-sm text-muted-foreground truncate">{j.company_name}</div>
              </div>
              <StatusBadge status={j.status} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: number; hint?: string }) {
  return (
    <div className="border rounded-lg p-5 bg-card">
      <div className="flex items-center gap-2 text-muted-foreground text-sm"><Icon className="size-4" />{label}</div>
      <div className="text-3xl font-semibold mt-3">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
