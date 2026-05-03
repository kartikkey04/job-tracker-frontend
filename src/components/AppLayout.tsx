import { Link, Outlet, useRouter, useRouterState } from "@tanstack/react-router";
import { Briefcase, LayoutDashboard, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Applications", icon: Briefcase },
  { to: "/ai", label: "AI Tools", icon: Sparkles },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 border-r bg-card/40 flex flex-col">
        <div className="px-5 py-5 border-b">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">J</div>
            <span className="font-semibold tracking-tight">Jobtrail</span>
          </Link>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {nav.map((n) => {
            const active = path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition ${active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}>
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <div className="px-2 pb-2">
            <div className="text-sm font-medium truncate">{user?.name || "You"}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={async () => { await logout(); router.navigate({ to: "/login" }); }}>
            <LogOut className="size-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
