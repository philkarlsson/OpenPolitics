import { Router } from "express";
import { onboardingSchema, profileUpsertSchema, pushTokenSchema } from "@openpolitics/shared";
import { mapProfile } from "../domain/mappers.js";
import { HttpError } from "../http/errors.js";
import { requireAuth } from "../http/auth.js";
import { createSupabaseClient } from "../supabase.js";

export const meRouter = Router();

meRouter.use(requireAuth);

meRouter.get("/", async (request, response) => {
  const supabase = createSupabaseClient(request.accessToken);
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id,slug,display_name,avatar_url,bio,locale,timezone,country_scope_id,region_scope_id,municipality_scope_id,onboarding_completed_at,privacy"
    )
    .eq("id", request.user?.id)
    .maybeSingle();

  if (error) {
    throw new HttpError(502, "PROFILE_READ_FAILED", error.message);
  }

  response.json({ data: data ? mapProfile(data) : null, auth: { userId: request.user?.id, email: request.user?.email } });
});

meRouter.put("/profile", async (request, response) => {
  const input = profileUpsertSchema.parse(request.body);
  const supabase = createSupabaseClient(request.accessToken);
  const userId = request.user?.id;

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        slug: input.slug,
        display_name: input.displayName,
        avatar_url: input.avatarUrl ?? null,
        bio: input.bio ?? null,
        locale: input.locale,
        timezone: input.timezone,
        country_scope_id: input.countryScopeId ?? null,
        region_scope_id: input.regionScopeId ?? null,
        municipality_scope_id: input.municipalityScopeId ?? null,
        privacy: input.privacy
      },
      { onConflict: "id" }
    )
    .select(
      "id,slug,display_name,avatar_url,bio,locale,timezone,country_scope_id,region_scope_id,municipality_scope_id,onboarding_completed_at,privacy"
    )
    .single();

  if (error) {
    throw new HttpError(502, "PROFILE_SAVE_FAILED", error.message);
  }

  response.json({ data: mapProfile(data) });
});

meRouter.post("/onboarding", async (request, response) => {
  const input = onboardingSchema.parse(request.body);
  const supabase = createSupabaseClient(request.accessToken);
  const userId = request.user?.id;
  const scopeIds = [input.countryScopeId, input.regionScopeId, input.municipalityScopeId].filter(Boolean);

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        slug: input.slug,
        display_name: input.displayName,
        avatar_url: input.avatarUrl ?? null,
        bio: input.bio ?? null,
        locale: input.locale,
        timezone: input.timezone,
        country_scope_id: input.countryScopeId,
        region_scope_id: input.regionScopeId ?? null,
        municipality_scope_id: input.municipalityScopeId ?? null,
        onboarding_completed_at: new Date().toISOString(),
        privacy: input.privacy
      },
      { onConflict: "id" }
    )
    .select(
      "id,slug,display_name,avatar_url,bio,locale,timezone,country_scope_id,region_scope_id,municipality_scope_id,onboarding_completed_at,privacy"
    )
    .single();

  if (error) {
    throw new HttpError(502, "ONBOARDING_SAVE_FAILED", error.message);
  }

  if (scopeIds.length > 0) {
    const { error: assignmentError } = await supabase.from("user_geographic_scopes").upsert(
      scopeIds.map((scopeId) => ({
        user_id: userId,
        geographic_scope_id: scopeId,
        assignment_type: "residence"
      })),
      { onConflict: "user_id,geographic_scope_id,assignment_type" }
    );

    if (assignmentError) {
      throw new HttpError(502, "GEOGRAPHIC_ASSIGNMENT_FAILED", assignmentError.message);
    }
  }

  response.status(201).json({ data: mapProfile(data) });
});

meRouter.put("/push-tokens", async (request, response) => {
  const input = pushTokenSchema.parse(request.body);
  const supabase = createSupabaseClient(request.accessToken);
  const userId = request.user?.id;

  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: userId,
      token: input.token,
      platform: input.platform,
      device_id: input.deviceId ?? null,
      app_version: input.appVersion ?? null,
      last_seen_at: new Date().toISOString()
    },
    { onConflict: "token" }
  );

  if (error) {
    throw new HttpError(502, "PUSH_TOKEN_SAVE_FAILED", error.message);
  }

  response.status(204).send();
});
