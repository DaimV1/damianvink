import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/kennis/")({
  beforeLoad: () => {
    throw redirect({ href: "/denk", statusCode: 301 });
  },
  component: () => null,
});
