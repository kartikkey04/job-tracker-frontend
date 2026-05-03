import { createFileRoute, redirect } from "@tanstack/react-router";
import { tokens } from "@/lib/api";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      throw redirect({ to: tokens.access ? "/dashboard" : "/login" });
    }
  },
  component: () => null,
});
