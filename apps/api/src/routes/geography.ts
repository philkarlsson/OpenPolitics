import { Router } from "express";
import { createSupabaseClient } from "../supabase.js";
import { HttpError } from "../http/errors.js";
import { mapScope } from "../domain/mappers.js";

export const geographyRouter = Router();

geographyRouter.get("/countries", async (_request, response) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("geographic_scopes")
    .select("id,parent_id,country_code,scope_type,slug,name,local_name")
    .eq("scope_type", "country")
    .order("local_name", { ascending: true });

  if (error) {
    throw new HttpError(502, "GEOGRAPHY_READ_FAILED", error.message);
  }

  response.json({ data: data.map(mapScope) });
});

geographyRouter.get("/regions", async (request, response) => {
  const countryCode = String(request.query.countryCode ?? "DE").toUpperCase();
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("geographic_scopes")
    .select("id,parent_id,country_code,scope_type,slug,name,local_name")
    .eq("country_code", countryCode)
    .eq("scope_type", "region")
    .order("local_name", { ascending: true });

  if (error) {
    throw new HttpError(502, "GEOGRAPHY_READ_FAILED", error.message);
  }

  response.json({ data: data.map(mapScope) });
});
