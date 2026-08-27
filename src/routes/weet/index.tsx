import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/weet/")({
  beforeLoad: () => {
    throw redirect({ href: "/denk" });
  },
  component: () => null,
});
