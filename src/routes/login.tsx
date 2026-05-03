import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-muted/40 border-r">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-semibold">J</div>
          <span className="font-semibold">Jobtrail</span>
        </Link>
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight">Your job hunt, organized.</h1>
          <p className="mt-3 text-muted-foreground">Track every application, log status changes, and let AI write your cover letters and prep you for interviews.</p>
        </div>
        <p className="text-xs text-muted-foreground">© Jobtrail</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="text-sm text-muted-foreground mt-1">Welcome back. Enter your credentials.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
          </form>
          <p className="text-sm text-muted-foreground mt-6">No account? <Link to="/register" className="text-foreground underline underline-offset-4">Create one</Link></p>
        </div>
      </div>
    </div>
  );
}
