import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./config";
import { supabaseCookieOptions } from "./cookie-options";
import type { Database } from "@/types/database";

export function createClient() {
  const config = getSupabasePublicConfig();
  if (!config) throw new Error("Supabase authentication is not configured.");
  return createBrowserClient<Database>(config.url, config.key, {
    cookieOptions: supabaseCookieOptions,
  });
}
