import { z } from "zod";

export const supportedLocales = ["de-DE", "en-US"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const scopeTypes = ["country", "region", "municipality"] as const;
export type ScopeType = (typeof scopeTypes)[number];

export const profileVisibilityValues = ["public", "followers", "private"] as const;
export type ProfileVisibility = (typeof profileVisibilityValues)[number];

export const localeSchema = z.enum(supportedLocales);

export const slugSchema = z
  .string()
  .trim()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const profilePrivacySchema = z.object({
  profileVisibility: z.enum(profileVisibilityValues).default("public")
});

export const profileUpsertSchema = z.object({
  slug: slugSchema,
  displayName: z.string().trim().min(2).max(80),
  avatarUrl: z.string().url().max(500).nullable().optional(),
  bio: z.string().trim().max(500).nullable().optional(),
  locale: localeSchema.default("de-DE"),
  timezone: z.string().trim().min(1).max(80).default("Europe/Berlin"),
  countryScopeId: z.string().uuid().nullable().optional(),
  regionScopeId: z.string().uuid().nullable().optional(),
  municipalityScopeId: z.string().uuid().nullable().optional(),
  privacy: profilePrivacySchema.default({ profileVisibility: "public" })
});

export const onboardingSchema = profileUpsertSchema.extend({
  countryScopeId: z.string().uuid(),
  regionScopeId: z.string().uuid().nullable().optional(),
  municipalityScopeId: z.string().uuid().nullable().optional()
});

export const pushTokenSchema = z.object({
  token: z.string().trim().min(1).max(4096),
  platform: z.enum(["android", "ios", "web"]),
  deviceId: z.string().trim().max(200).nullable().optional(),
  appVersion: z.string().trim().max(80).nullable().optional()
});

export type ProfileUpsertInput = z.infer<typeof profileUpsertSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type PushTokenInput = z.infer<typeof pushTokenSchema>;

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type HealthResponse = {
  status: "ok";
  service: "api";
  version: string;
};

export type GeographicScope = {
  id: string;
  parentId: string | null;
  countryCode: string;
  scopeType: ScopeType;
  slug: string;
  name: string;
  localName: string | null;
};

export type Profile = {
  id: string;
  slug: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  locale: SupportedLocale;
  timezone: string;
  countryScopeId: string | null;
  regionScopeId: string | null;
  municipalityScopeId: string | null;
  onboardingCompletedAt: string | null;
  privacy: ProfileVisibility;
};

export function toSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 64);
}
