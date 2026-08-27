import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/weet/$")({
  beforeLoad: ({ params }) => {
    throw redirect({ href: `/denk/${params._splat}` });
  },
  component: () => null,
});
