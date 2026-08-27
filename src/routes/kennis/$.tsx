import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/kennis/$")({
  beforeLoad: ({ params }) => {
    throw redirect({ href: `/denk/${params._splat}`, statusCode: 301 });
  },
  component: () => null,
});
