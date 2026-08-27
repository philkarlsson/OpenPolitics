export const webConfig = {
  apiUrl: import.meta.env.VITE_API_URL || "http://127.0.0.1:4000",
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "http://127.0.0.1:54331",
  supabasePublishableKey:
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
};
