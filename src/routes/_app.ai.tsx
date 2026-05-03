import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { aiApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai")({ component: AIPage });

function AIPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2"><Sparkles className="size-5" /> AI tools</h1>
        <p className="text-sm text-muted-foreground mt-1">Limited to 5 requests per hour. Identical inputs are cached.</p>
      </header>
      <Tabs defaultValue="cover">
        <TabsList>
          <TabsTrigger value="cover">Cover letter</TabsTrigger>
          <TabsTrigger value="tips">Interview tips</TabsTrigger>
          <TabsTrigger value="match">Resume match</TabsTrigger>
        </TabsList>
        <TabsContent value="cover" className="mt-6"><CoverLetter /></TabsContent>
        <TabsContent value="tips" className="mt-6"><InterviewTips /></TabsContent>
        <TabsContent value="match" className="mt-6"><ResumeMatch /></TabsContent>
      </Tabs>
    </div>
  );
}

function ResultBox({ children }: { children: string }) {
  return (
    <div className="border rounded-lg bg-card p-4 mt-4 relative">
      <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={() => { navigator.clipboard.writeText(children); toast.success("Copied"); }}><Copy className="size-3.5" /></Button>
      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{children}</pre>
    </div>
  );
}

function extractText(d: any): string {
  if (!d) return "";
  if (typeof d === "string") return d;
  return d.cover_letter || d.coverLetter || d.tips || d.interview_tips || d.text || d.result || d.content || JSON.stringify(d, null, 2);
}

function CoverLetter() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jd, setJd] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <form className="space-y-3" onSubmit={async (e) => {
      e.preventDefault(); setLoading(true);
      try { const r = await aiApi.coverLetter({ company_name: company, role_title: role, job_description: jd }); setOut(extractText(r)); }
      catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Company</Label><Input required value={company} onChange={(e) => setCompany(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Role</Label><Input required value={role} onChange={(e) => setRole(e.target.value)} /></div>
      </div>
      <div className="space-y-1.5"><Label>Job description (50+ chars)</Label><Textarea rows={8} required minLength={50} value={jd} onChange={(e) => setJd(e.target.value)} /></div>
      <Button type="submit" disabled={loading}>{loading ? "Generating…" : "Generate cover letter"}</Button>
      {out && <ResultBox>{out}</ResultBox>}
    </form>
  );
}

function InterviewTips() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jd, setJd] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <form className="space-y-3" onSubmit={async (e) => {
      e.preventDefault(); setLoading(true);
      try { const r = await aiApi.interviewTips({ company_name: company, role_title: role, job_description: jd }); setOut(extractText(r)); }
      catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
    }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Company</Label><Input required value={company} onChange={(e) => setCompany(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Role</Label><Input required value={role} onChange={(e) => setRole(e.target.value)} /></div>
      </div>
      <div className="space-y-1.5"><Label>Job description</Label><Textarea rows={8} required minLength={50} value={jd} onChange={(e) => setJd(e.target.value)} /></div>
      <Button type="submit" disabled={loading}>{loading ? "Generating…" : "Get interview tips"}</Button>
      {out && <ResultBox>{out}</ResultBox>}
    </form>
  );
}

function ResumeMatch() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  return (
    <form className="space-y-3" onSubmit={async (e) => {
      e.preventDefault(); setLoading(true);
      try { const r = await aiApi.resumeMatch({ resume_text: resume, job_description: jd }); setOut(r); }
      catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
    }}>
      <div className="space-y-1.5"><Label>Resume text (100+ chars)</Label><Textarea rows={8} required minLength={100} value={resume} onChange={(e) => setResume(e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Job description</Label><Textarea rows={6} required minLength={50} value={jd} onChange={(e) => setJd(e.target.value)} /></div>
      <Button type="submit" disabled={loading}>{loading ? "Analyzing…" : "Score match"}</Button>
      {out && (
        <div className="mt-4 space-y-3">
          {(out.score ?? out.match_score) != null && (
            <div className="border rounded-lg p-5 bg-card">
              <div className="text-xs text-muted-foreground">Match score</div>
              <div className="text-4xl font-semibold mt-1">{out.score ?? out.match_score}<span className="text-lg text-muted-foreground">/100</span></div>
            </div>
          )}
          <ResultBox>{extractText(out)}</ResultBox>
        </div>
      )}
    </form>
  );
}
