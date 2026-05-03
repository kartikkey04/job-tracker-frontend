import { createFileRoute, useRouter } from "@tanstack/react-router";
import { JobForm } from "@/components/JobForm";
import { jobsApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/jobs/new")({ component: NewJob });

function NewJob() {
  const router = useRouter();
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">New application</h1>
      <p className="text-sm text-muted-foreground mb-6">Track a new job opportunity.</p>
      <JobForm
        onSubmit={async (data) => {
          try {
            const r = await jobsApi.create(data);
            toast.success("Application created");
            router.navigate({ to: "/jobs/$id", params: { id: r.job.id } });
          } catch (e: any) { toast.error(e.message); }
        }}
      />
    </div>
  );
}
