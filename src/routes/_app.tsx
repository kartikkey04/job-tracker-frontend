import { createFileRoute, redirect } from "@tanstack/react-router";
import { tokens } from "@/lib/api";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !tokens.access) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});
