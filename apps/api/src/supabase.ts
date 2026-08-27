import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";
import { notConfigured } from "./http/errors.js";

export function createSupabaseClient(accessToken?: string) {
  if (!config.supabasePublishableKey) {
    throw notConfigured("SUPABASE_PUBLISHABLE_KEY or LOCAL_SUPABASE_PUBLISHABLE_KEY is required");
  }

  return createClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      : undefined
  });
}
