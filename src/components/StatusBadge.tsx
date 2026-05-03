import type { JobStatus } from "@/lib/api";

const cls: Record<JobStatus, string> = {
  applied: "status-applied",
  screening: "status-screening",
  interview: "status-interview",
  offer: "status-offer",
  rejected: "status-rejected",
  withdrawn: "status-withdrawn",
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls[status]}`}>
      {status}
    </span>
  );
}
