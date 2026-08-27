import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  API_HOST: z.string().default("127.0.0.1"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().url().default("http://127.0.0.1:3000"),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  LOCAL_SUPABASE_URL: z.string().url().optional(),
  LOCAL_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  npm_package_version: z.string().default("0.1.0")
});

const parsed = envSchema.parse(process.env);

export const config = {
  host: parsed.API_HOST,
  port: parsed.API_PORT,
  webOrigin: parsed.WEB_ORIGIN,
  version: parsed.npm_package_version,
  supabaseUrl: parsed.LOCAL_SUPABASE_URL ?? parsed.SUPABASE_URL ?? "http://127.0.0.1:54331",
  supabasePublishableKey:
    parsed.LOCAL_SUPABASE_PUBLISHABLE_KEY ??
    parsed.SUPABASE_PUBLISHABLE_KEY ??
    "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
};
