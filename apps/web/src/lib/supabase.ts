import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../../supabase/types/database.types";
import { webConfig } from "../config";

export const supabase = createClient<Database>(webConfig.supabaseUrl, webConfig.supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
