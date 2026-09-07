import { createServerFn } from "@tanstack/react-start";
import { validateDemoInput } from "./demo";

export const generateDemo = createServerFn({ method: "POST" })
  .validator(validateDemoInput)
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const { generate } = await import("./provider.server");
    return generate(data);
  });
