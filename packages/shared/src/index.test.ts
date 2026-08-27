import { describe, expect, it } from "vitest";
import { onboardingSchema, toSlug } from "./index.js";

describe("shared schemas", () => {
  it("normalizes names to stable slugs", () => {
    expect(toSlug("Philipp Karlsson / Berlin")).toBe("philipp-karlsson-berlin");
  });

  it("validates onboarding payloads", () => {
    const result = onboardingSchema.safeParse({
      slug: "philipp-karlsson",
      displayName: "Philipp Karlsson",
      locale: "de-DE",
      timezone: "Europe/Berlin",
      countryScopeId: "00000000-0000-4000-8000-000000000000"
    });

    expect(result.success).toBe(true);
  });
});
