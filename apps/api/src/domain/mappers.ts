import type { GeographicScope, Profile, ProfileVisibility } from "@openpolitics/shared";

type ScopeRow = {
  id: string;
  parent_id: string | null;
  country_code: string;
  scope_type: "country" | "region" | "municipality";
  slug: string;
  name: string;
  local_name: string | null;
};

type ProfileRow = {
  id: string;
  slug: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  locale: "de-DE" | "en-US";
  timezone: string;
  country_scope_id: string | null;
  region_scope_id: string | null;
  municipality_scope_id: string | null;
  onboarding_completed_at: string | null;
  privacy: { profileVisibility?: ProfileVisibility } | null;
};

export function mapScope(row: ScopeRow): GeographicScope {
  return {
    id: row.id,
    parentId: row.parent_id,
    countryCode: row.country_code,
    scopeType: row.scope_type,
    slug: row.slug,
    name: row.name,
    localName: row.local_name
  };
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    slug: row.slug,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    locale: row.locale,
    timezone: row.timezone,
    countryScopeId: row.country_scope_id,
    regionScopeId: row.region_scope_id,
    municipalityScopeId: row.municipality_scope_id,
    onboardingCompletedAt: row.onboarding_completed_at,
    privacy: row.privacy?.profileVisibility ?? "public"
  };
}
