import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicConfig } from "./config";
import { supabaseCookieOptions } from "./cookie-options";
import type { Database } from "@/types/database";

export async function createClient() {
  const config = getSupabasePublicConfig();
  if (!config) throw new Error("Supabase authentication is not configured.");
  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.key, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot write cookies; proxy.ts refreshes sessions.
        }
      },
    },
  });
}
